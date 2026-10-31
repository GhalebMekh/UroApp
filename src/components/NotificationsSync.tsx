import { useEffect, useRef, useState } from 'react';
import type { Screen } from '@/navigation';
import { useConferenceFeed } from '@/lib/conferencesFeed';
import { ATTENDING_KEY, loadAttending } from '@/lib/cmeConferences';
import { onStorageChange } from '@/lib/storage';
import {
  NOTIFY_KEY,
  loadPrefs,
  notificationsSupported,
  onNotificationTap,
  planConferenceAlerts,
  reschedule,
} from '@/lib/notifications';

/**
 * Keeps the phone's scheduled reminders in step with the settings, the
 * conference list and the "I'm attending" list, and opens the right screen
 * when a reminder is tapped. Renders nothing; inert outside the native app.
 */
export function NotificationsSync({ onOpen }: { onOpen: (screen: Screen) => void }) {
  const feed = useConferenceFeed();
  const [version, setVersion] = useState(0);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => onNotificationTap((s) => openRef.current(s)), []);

  useEffect(
    () => onStorageChange((key) => (key === NOTIFY_KEY || key === ATTENDING_KEY) && setVersion((v) => v + 1)),
    [],
  );

  useEffect(() => {
    if (!notificationsSupported()) return;
    let stale = false;
    void Promise.all([loadPrefs(), loadAttending()]).then(([prefs, attending]) => {
      if (stale) return;
      const ids = new Set(attending.map((a) => a.id));
      const alerts = planConferenceAlerts(feed.conferences, ids, prefs.conferences, new Date());
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
