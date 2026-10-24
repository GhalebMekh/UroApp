import { Fragment, type ReactNode } from 'react';
import { useAccount } from '@/lib/accountContext';

/**
 * Remounts the current screen when cloud sync has changed this device's data,
 * so screens that read storage once on mount show what the other device added
 * (and never write back a stale copy over it).
 */
export function SyncBoundary({ children }: { children: ReactNode }) {
  const { dataVersion } = useAccount();
  return <Fragment key={dataVersion}>{children}</Fragment>;
}
