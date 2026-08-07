import { useEffect, useMemo, useRef, useState } from 'react';
import { SEARCH_INDEX } from '@/data/searchIndex';
import type { Screen } from '@/navigation';
import { SearchIcon } from './icons';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

/** App-wide quick search — jumps to the workspace that holds a matching item. */
export function SearchOverlay({ open, onClose, onNavigate }: SearchOverlayProps) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      // focus after paint
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SEARCH_INDEX.slice(0, 8);
    return SEARCH_INDEX.filter((i) => i.keywords.includes(term) || i.label.toLowerCase().includes(term)).slice(0, 14);
  }, [q]);

  if (!open) return null;

  function go(screen: Screen) {
    onNavigate(screen);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-navy/80 px-4 pt-[12dvh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[16px] border border-line bg-navy-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <SearchIcon className="text-[18px] text-muted-2" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search calculators, procedures, emergencies…"
            className="w-full bg-transparent py-3.5 text-[15px] text-ink outline-none placeholder:text-muted-2"
          />
          <button type="button" onClick={onClose} className="text-[12px] text-muted-2 hover:text-ink">
            Esc
          </button>
        </div>

        <ul className="max-h-[60dvh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-4 text-center text-[13px] text-muted-2">No matches.</li>
          ) : (
            results.map((item) => (
              <li key={`${item.screen}-${item.label}`}>
                <button
                  type="button"
                  onClick={() => go(item.screen)}
                  className="flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-steel"
                >
                  <span className="text-[14px] font-medium text-ink">{item.label}</span>
                  <span className="ml-3 shrink-0 text-[11px] text-muted-2">{item.sub}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
