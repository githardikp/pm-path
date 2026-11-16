import { useEffect } from 'react';
import { create } from 'zustand';
import { Check, TriangleAlert } from 'lucide-react';
import { cx } from './ui';

interface ToastItem {
  id: number;
  text: string;
  kind: 'ok' | 'err';
}

const useToasts = create<{ items: ToastItem[] }>(() => ({ items: [] }));
let nextId = 1;

/** Show a short confirmation, e.g. toast('Copied'). */
export function toast(text: string, kind: 'ok' | 'err' = 'ok') {
  const id = nextId++;
  useToasts.setState((s) => ({ items: [...s.items.slice(-2), { id, text, kind }] }));
  setTimeout(() => useToasts.setState((s) => ({ items: s.items.filter((t) => t.id !== id) })), 2600);
}

/** Copy text and confirm with a toast. */
export async function copyText(text: string, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    toast(label);
  } catch {
    toast('Couldn’t copy. Select the text and copy it yourself.', 'err');
  }
}

export function Toaster() {
  const items = useToasts((s) => s.items);
  useEffect(() => () => useToasts.setState({ items: [] }), []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-3 px-4 lg:bottom-6" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={cx('nb-card bounce-in flex items-center gap-2 px-4 py-2.5 font-display', t.kind === 'ok' ? 'bg-mint' : 'bg-pink')}>
          {t.kind === 'ok' ? <Check size={16} aria-hidden /> : <TriangleAlert size={16} aria-hidden />}
          {t.text}
        </div>
      ))}
    </div>
  );
}
