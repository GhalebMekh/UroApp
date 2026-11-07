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
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Conference } from '@/data/conferences';
import type { Screen, ScreenLink } from '@/navigation';
import { formatSpan } from './conferenceDates';
import { getJSON, setJSON } from './storage';
import { SIDE_LABEL, STENT_LEAD_DAYS, formatDay, type Stent } from './stents';
import { toLocalISODate } from './date';

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
  /** Where a tap opens when it's more specific than `screen`, e.g. a Residency tab. */
  link?: ScreenLink;
  /** Ward reminders: the reminder's id, so Done / Snooze can find it. */
  reminderId?: string;
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

/** The ward list's storage key (RoundingScreen); its plan reminders become alerts. */
export const WARD_KEY = 'uroapp.rounding.v1';

/**
 * Ward plan reminders that have a due time and are not done, fired at that
 * time, named by the patient's de-identified label (owner, 2026-11-03: "Patient XX
 * has a reminder for XX"). Names are initials only (RoundingScreen), as this
 * text shows on the lock screen.
 */
export function planWardAlerts(rawPatients: unknown, now: Date): PlannedAlert[] {
  const out: PlannedAlert[] = [];
  if (!Array.isArray(rawPatients)) return out;
  for (const p of rawPatients as { name?: unknown; location?: unknown; reminders?: unknown }[]) {
    const name = typeof p?.name === 'string' ? p.name.trim() : '';
    const bed = typeof p?.location === 'string' ? p.location.trim() : '';
    if (!Array.isArray(p?.reminders)) continue;
    for (const r of p.reminders as { id?: unknown; text?: unknown; due?: unknown; done?: unknown }[]) {
      if (r?.done === true || typeof r?.due !== 'string' || !r.due) continue;
      const at = new Date(r.due); // datetime-local: local wall time (lib/reminders.ts)
      if (Number.isNaN(at.getTime()) || at <= now) continue;
      out.push({
        id: 3000 + out.length,
        title: name ? `Patient ${name}${bed ? ` (${bed})` : ''} has a reminder` : 'Ward plan reminder',
        body: typeof r.text === 'string' && r.text.trim() ? `Reminder for: ${r.text.trim()}` : 'A plan reminder is due.',
        at,
        screen: 'residency',
        ...(typeof r.id === 'string' ? { reminderId: r.id } : {}),
      });
    }
  }
  return out;
}

/** Notification buttons on a ward reminder (owner, 2026-11-03). */
export const WARD_ACTION_TYPE = 'ward-reminder';
export const SNOOZE_MINUTES = 60;
export type WardAction = 'done' | 'snooze';

const wardActionListeners = new Set<() => void>();

/** Called after Done / Snooze rewrites the ward list, so an open ward screen reloads it. */
export function onWardActionApplied(listener: () => void): () => void {
  wardActionListeners.add(listener);
  return () => wardActionListeners.delete(listener);
}

/** "YYYY-MM-DDTHH:mm" in local time, the format reminders store (lib/reminders.ts). */
function localStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** The ward list with one reminder marked done, or moved SNOOZE_MINUTES from now. */
export function applyWardAction(rawPatients: unknown, reminderId: string, action: WardAction, now: Date): unknown {
  if (!Array.isArray(rawPatients)) return rawPatients;
  return rawPatients.map((p: { reminders?: unknown }) => {
    if (!p || !Array.isArray(p.reminders)) return p;
    return {
      ...p,
      reminders: (p.reminders as { id?: unknown }[]).map((r) =>
        r?.id !== reminderId
          ? r
          : action === 'done'
            ? { ...r, done: true }
            : { ...r, due: localStamp(new Date(now.getTime() + SNOOZE_MINUTES * 60_000)) },
      ),
    };
  });
}

/** Saved surveillance schedules to remind about (SurveillanceScreen). */
export const FOLLOWUP_KEY = 'uroapp.followups.v1';

export interface FollowUpPlan {
  id: string;
  /** Short de-identified label the user chose, e.g. "Bed 4" or "Case A". */
  label: string;
  /** e.g. "NMIBC — High risk". */
  title: string;
  visits: { label: string; due: string }[];
}

export function normalizeFollowUps(raw: unknown): FollowUpPlan[] {
  if (!Array.isArray(raw)) return [];
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  return raw
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map((p) => ({
      id: s(p.id),
      label: s(p.label),
      title: s(p.title),
      visits: (Array.isArray(p.visits) ? p.visits : [])
        .map((v: Record<string, unknown>) => ({ label: s(v?.label), due: s(v?.due) }))
        .filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v.due)),
    }))
    .filter((p) => p.id);
}

/** Days before a surveillance visit that its reminder fires, at 09:00. */
export const FOLLOWUP_LEAD_DAYS = 7;

export function planFollowUpAlerts(plans: readonly FollowUpPlan[], now: Date): PlannedAlert[] {
  const out: PlannedAlert[] = [];
  for (const p of plans) {
    for (const v of p.visits) {
      const at = new Date(`${v.due}T09:00:00`);
      at.setDate(at.getDate() - FOLLOWUP_LEAD_DAYS);
      if (at <= now) continue;
      out.push({
        id: 5000 + out.length,
        title: p.label ? `Patient ${p.label}: follow-up in 1 week` : 'Follow-up in 1 week',
        body: `${p.title}: ${v.label} visit due ${v.due}.`,
        at,
        screen: 'surveillance',
      });
    }
  }
  return out;
}

/**
 * Stent register: one alert at 09:00 a week before the remove-by date (owner,
 * 2026-11-06). A remove-by date set less than a week ahead would miss that, so
 * it gets one at 09:00 on the day instead — only then, so a stent never gets
 * two. Removed stents get none. Title uses the initials only; the free-text
 * note never reaches the lock screen.
 */
export function planStentAlerts(stents: readonly Stent[], now: Date): PlannedAlert[] {
  const out: PlannedAlert[] = [];
  for (const s of stents) {
    if (s.removed) continue;
    const early = new Date(`${s.removeBy}T09:00:00`);
    early.setDate(early.getDate() - STENT_LEAD_DAYS);
    const onDay = new Date(`${s.removeBy}T09:00:00`);
    const setLate = s.setOn !== '' && s.setOn >= toLocalISODate(early);
    const at = early > now ? early : setLate && onDay > now ? onDay : null;
    if (!at) continue;
    const when = at === early ? 'due out in 1 week' : 'due out today';
    out.push({
      id: 6000 + out.length,
      title: s.label ? `Patient ${s.label}: stent ${when}` : `Stent ${when}`,
      body: `${SIDE_LABEL[s.side]} stent, remove by ${formatDay(s.removeBy)}. Book the removal.`,
      at,
      screen: 'residency',
      link: { residency: { section: 'or', orTab: 'stents' } },
    });
  }
  return out;
}

/** Bundled chime (public/reminder.wav). The plugin plays no sound unless one is named. */
const SOUND = 'reminder.wav';

const WEEKLY_ID = 1000;

// Never `await` or return this from a promise: Capacitor plugin proxies answer
// every property, including `then`, so JS treats them as a pending promise and
// waits forever (that is what silently blocked every reminder before build 7).
const plugin = () => LocalNotifications;

export const notificationsSupported = () => Capacitor.isNativePlatform();

const grantListeners = new Set<() => void>();

/** Called after permission is granted, so the schedule can be rebuilt with it. */
export function onPermissionGranted(listener: () => void): () => void {
  grantListeners.add(listener);
  return () => grantListeners.delete(listener);
}

/** Ask iOS for permission (shows the system prompt the first time). */
export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const ln = plugin();
  const { display } = await ln.requestPermissions();
  if (display === 'granted') grantListeners.forEach((l) => l());
  return display === 'granted';
}

export async function permissionState(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  const { display } = await plugin().checkPermissions();
  return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
}

/**
 * Replace every pending UroApp notification with the current plan. `alerts`
 * are the one-off ones (conferences, ward, follow-ups); the soonest are kept
 * within iOS's pending limit, and later ones get scheduled on a later run.
 */
export async function reschedule(prefs: NotifyPrefs, alerts: PlannedAlert[]): Promise<void> {
  const oneOff = [...alerts].sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_PENDING - 1);
  if (!notificationsSupported()) return;
  const ln = plugin();
  const pending = await ln.getPending();
  const ours = pending.notifications;
  if (ours.length) {
    await ln.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
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
            sound: SOUND,
            extra: { screen: 'articles' satisfies Screen },
          },
        ]
      : []),
    ...oneOff.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      schedule: { at: a.at, allowWhileIdle: true },
      sound: SOUND,
      extra: { screen: a.screen, link: a.link, reminderId: a.reminderId },
      ...(a.reminderId ? { actionTypeId: WARD_ACTION_TYPE } : {}),
    })),
  ];
  if (notifications.length) {
    await ln.registerActionTypes({
      types: [
        {
          id: WARD_ACTION_TYPE,
          actions: [
            { id: 'done', title: 'Done' },
            { id: 'snooze', title: `Snooze ${SNOOZE_MINUTES / 60} hour` },
          ],
        },
      ],
    });
    await ln.schedule({ notifications });
  }
}

/** Call `open` with where a tapped notification points. Returns an unsubscribe. */
export function onNotificationTap(open: (link: ScreenLink) => void): () => void {
  if (!notificationsSupported()) return () => {};
  let remove: (() => void) | null = null;
  let cancelled = false;
  void plugin()
      .addListener('localNotificationActionPerformed', (e) => {
        const extra = e.notification.extra as { screen?: Screen; link?: ScreenLink; reminderId?: string } | undefined;
        if ((e.actionId === 'done' || e.actionId === 'snooze') && extra?.reminderId) {
          const id = extra.reminderId;
          const action: WardAction = e.actionId;
          void getJSON<unknown>(WARD_KEY, [])
            .then((ward) => setJSON(WARD_KEY, applyWardAction(ward, id, action, new Date())))
            .then(() => wardActionListeners.forEach((l) => l()));
          return;
        }
        if (extra?.link) open(extra.link);
        else if (extra?.screen) open({ screen: extra.screen });
      })
      .then((h) => {
        if (cancelled) void h.remove();
        else remove = () => void h.remove();
      });
  return () => {
    cancelled = true;
    remove?.();
  };
}

