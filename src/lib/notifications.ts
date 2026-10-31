/**
 * Local reminders: a weekly "new reads" nudge and alerts before conferences.
 *
 * Everything is scheduled on the phone (@capacitor/local-notifications) — no
 * push server, no device token, nothing leaves the device. Off until the user
 * switches a reminder on in More → Notifications, which is when iOS asks for
 * permission. The whole schedule is rebuilt whenever the settings, the
 * conference list or the "I'm attending" list change (NotificationsSync).
 */
import { Capacitor } from '@capacitor/core';
import type { Conference } from '@/data/conferences';
import type { Screen } from '@/navigation';
import { formatSpan } from './conferenceDates';
import { getJSON, setJSON } from './storage';

export const NOTIFY_KEY = 'uroapp.notify.v1';

export type ConferenceScope = 'off' | 'attending' | 'all';

export interface NotifyPrefs {
  weekly: boolean;
  conferences: ConferenceScope;
}

export const DEFAULT_PREFS: NotifyPrefs = { weekly: false, conferences: 'off' };

/** Weekly reads refresh on Sunday (GitHub job), so the nudge goes out Monday 09:00. */
export const WEEKLY = { weekday: 2, hour: 9, minute: 0 } as const; // 1 = Sunday (iOS)
/** Conference alerts: two weeks before and the day before, at 09:00. */
export const CONF_LEAD_DAYS = [14, 1] as const;
/** iOS keeps at most 64 pending local notifications per app. */
const MAX_PENDING = 60;

export interface PlannedAlert {
  id: number;
  title: string;
  body: string;
  /** Local date-time to fire at. */
  at: Date;
  screen: Screen;
}

export function normalizePrefs(raw: unknown): NotifyPrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    weekly: r.weekly === true,
    conferences: r.conferences === 'attending' || r.conferences === 'all' ? r.conferences : 'off',
  };
}

export async function loadPrefs(): Promise<NotifyPrefs> {
  return normalizePrefs(await getJSON<unknown>(NOTIFY_KEY, null));
}

export function savePrefs(p: NotifyPrefs): Promise<void> {
  return setJSON(NOTIFY_KEY, p);
}

/**
 * The one-off conference alerts to schedule, soonest first. Pure — `now` is
 * passed in — so it can be tested. Alerts already in the past are skipped.
 */
export function planConferenceAlerts(
  conferences: readonly Conference[],
  attendingIds: ReadonlySet<string>,
  scope: ConferenceScope,
  now: Date,
): PlannedAlert[] {
  if (scope === 'off') return [];
  const out: PlannedAlert[] = [];
  const list = conferences
    .filter((c) => scope === 'all' || attendingIds.has(c.id))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  list.forEach((c, i) => {
    CONF_LEAD_DAYS.forEach((lead, j) => {
      const at = new Date(`${c.startDate}T09:00:00`);
      at.setDate(at.getDate() - lead);
      if (at <= now) return;
      const when = lead === 1 ? 'starts tomorrow' : `is in ${lead === 14 ? '2 weeks' : `${lead} days`}`;
      out.push({
        id: 2000 + i * CONF_LEAD_DAYS.length + j,
        title: `${c.name} ${when}`,
        body: `${formatSpan(c.startDate, c.endDate)} · ${c.city}, ${c.country}. Check the official site for the programme.`,
        at,
        screen: 'conferences',
      });
    });
  });
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_PENDING - 1);
}

const WEEKLY_ID = 1000;

const plugin = () => import('@capacitor/local-notifications').then((m) => m.LocalNotifications);

export const notificationsSupported = () => Capacitor.isNativePlatform();

/** Ask iOS for permission (shows the system prompt the first time). */
export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const ln = await plugin();
  const { display } = await ln.requestPermissions();
  return display === 'granted';
}

export async function permissionState(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  const { display } = await (await plugin()).checkPermissions();
  return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
}

/** Replace every pending UroApp notification with the current plan. */
export async function reschedule(prefs: NotifyPrefs, conferenceAlerts: PlannedAlert[]): Promise<void> {
  if (!notificationsSupported()) return;
  const ln = await plugin();
  const pending = await ln.getPending();
  if (pending.notifications.length) {
    await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  }
  if ((await ln.checkPermissions()).display !== 'granted') return;

  const notifications = [
    ...(prefs.weekly
      ? [
          {
            id: WEEKLY_ID,
            title: 'Weekly reads',
            body: "This week's urology papers are ready.",
            schedule: { on: { ...WEEKLY }, allowWhileIdle: true },
            extra: { screen: 'articles' satisfies Screen },
          },
        ]
      : []),
    ...conferenceAlerts.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      schedule: { at: a.at, allowWhileIdle: true },
      extra: { screen: a.screen },
    })),
  ];
  if (notifications.length) await ln.schedule({ notifications });
}

/** Call `open` with the screen named by a tapped notification. Returns an unsubscribe. */
export function onNotificationTap(open: (screen: Screen) => void): () => void {
  if (!notificationsSupported()) return () => {};
  let remove: (() => void) | null = null;
  let cancelled = false;
  void plugin().then((ln) =>
    ln
      .addListener('localNotificationActionPerformed', (e) => {
        const screen = (e.notification.extra as { screen?: Screen } | undefined)?.screen;
        if (screen) open(screen);
      })
      .then((h) => {
        if (cancelled) void h.remove();
        else remove = () => void h.remove();
      }),
  );
  return () => {
    cancelled = true;
    remove?.();
  };
}
