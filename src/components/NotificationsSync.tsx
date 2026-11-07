import { useEffect, useRef, useState } from 'react';
import type { ScreenLink } from '@/navigation';
import { STENT_KEY, normalizeStents } from '@/lib/stents';
import { useConferenceFeed } from '@/lib/conferencesFeed';
import { ATTENDING_KEY, loadAttending } from '@/lib/cmeConferences';
import { getJSON, onStorageChange } from '@/lib/storage';
import {
  FOLLOWUP_KEY,
  NOTIFY_KEY,
  WARD_KEY,
  loadPrefs,
  normalizeFollowUps,
  notificationsSupported,
  onNotificationTap,
  onPermissionGranted,
  planConferenceAlerts,
  planFollowUpAlerts,
  planStentAlerts,
  planWardAlerts,
  reschedule,
} from '@/lib/notifications';

const WATCHED = new Set([NOTIFY_KEY, ATTENDING_KEY, WARD_KEY, FOLLOWUP_KEY, STENT_KEY]);

/**
 * Keeps the phone's scheduled reminders in step with the settings, the
 * conference list, the "I'm attending" list, ward plan reminders, saved
 * surveillance schedules and the stent register, and opens the right screen
 * when a reminder is tapped. Renders nothing; inert outside the native app.
 */
export function NotificationsSync({ onOpen }: { onOpen: (link: ScreenLink) => void }) {
  const feed = useConferenceFeed();
  const [version, setVersion] = useState(0);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => onNotificationTap((s) => openRef.current(s)), []);

  useEffect(() => onStorageChange((key) => WATCHED.has(key) && setVersion((v) => v + 1)), []);
  useEffect(() => onPermissionGranted(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    if (!notificationsSupported()) return;
    let stale = false;
    void Promise.all([
      loadPrefs(),
      loadAttending(),
      getJSON<unknown>(WARD_KEY, []),
      getJSON<unknown>(FOLLOWUP_KEY, []),
      getJSON<unknown>(STENT_KEY, []),
    ]).then(([prefs, attending, ward, followUps, stents]) => {
      if (stale) return;
      const now = new Date();
      const ids = new Set(attending.map((a) => a.id));
      const alerts = [
        ...planConferenceAlerts(feed.conferences, ids, prefs.conferences, now),
        ...planWardAlerts(ward, now),
        ...planFollowUpAlerts(normalizeFollowUps(followUps), now),
        ...planStentAlerts(normalizeStents(stents), now),
      ];
      void reschedule(prefs, alerts).catch(() => {
        /* scheduling failed (e.g. permission revoked) — nothing to show */
      });
    });
    return () => {
      stale = true;
    };
  }, [feed, version]);

  return null;
}
