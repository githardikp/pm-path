import { useEffect, useState } from 'react';
import { Cloud, CloudOff, LogOut, Mail, RefreshCw, ShieldCheck, Trash2, Smartphone, Laptop, Check, Loader } from 'lucide-react';
import { cloudEnabled } from '../lib/cloud/config';
import { useSync, signInWithGoogle, backendReady, loadBackend, sendEmailLink, isEmailLink, completeEmailLink, signOut, syncNow, resolveConflict, deleteCloudData, EMAIL_KEY, type SyncStatus } from '../lib/cloud/sync';
import type { ProgressSummary } from '../lib/cloud/decide';
import { Button, Callout, Card, CardTitle, Chip, Field, Input, PageHeader, cx } from '../components/ui';
import { SyncIllustration } from '../components/illustrations';
import type { Pastel } from '../data/types';

export const STATUS_META: Record<SyncStatus, { label: string; color?: Pastel }> = {
  off: { label: 'Sync not set up' },
  'signed-out': { label: 'Not signed in' },
  connecting: { label: 'Connecting…', color: 'sky' },
  synced: { label: 'Synced', color: 'mint' },
  saving: { label: 'Saving…', color: 'butter' },
  offline: { label: 'Offline, will sync later', color: 'peach' },
  error: { label: 'Sync problem', color: 'pink' },
  conflict: { label: 'Choose a copy', color: 'pink' },
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function SummaryCard({ title, icon, s, when, onPick, color }: { title: string; icon: React.ReactNode; s: ProgressSummary; when?: string; onPick: () => void; color: Pastel }) {
  return (
    <Card color={color} className="flex flex-col gap-3 p-5">
      <CardTitle icon={icon}>{title}</CardTitle>
      <ul className="space-y-1 text-sm">
        <li>
          <strong>{s.lessons}</strong> topics done
        </li>
        <li>
          <strong>{s.hours}</strong> hours logged
        </li>
        <li>
          <strong>{s.applications}</strong> applications tracked
        </li>
        <li>Last active: {s.lastActive ?? 'never'}</li>
        {when && <li>Saved to cloud: {when}</li>}
      </ul>
      <Button className="mt-auto" onClick={onPick}>
        Keep this copy
      </Button>
    </Card>
  );
}

export default function Account() {
  const { status, user, error, lastSyncedAt, conflict } = useSync();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkPending, setLinkPending] = useState(false);
  const [, tick] = useState(0);
  const [ready, setReady] = useState(backendReady());

  // Download the sign-in code as soon as this page opens, so tapping Google opens its window
  // immediately (Safari blocks the window if it opens after a delay).
  useEffect(() => {
    if (!cloudEnabled || ready) return;
    loadBackend().then(
      () => setReady(true),
      () => setReady(true),
    );
  }, [ready]);

  // Finish email-link sign-in when the user returns from their inbox.
  useEffect(() => {
    const href = window.location.href;
    void isEmailLink(href).then(async (yes) => {
      if (!yes) return;
      const saved = localStorage.getItem(EMAIL_KEY);
      if (saved) {
        setBusy(true);
        await completeEmailLink(saved, href);
        setBusy(false);
        window.history.replaceState(null, '', window.location.pathname);
      } else setLinkPending(true);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const meta = STATUS_META[status];
  const ago = lastSyncedAt ? timeAgo(lastSyncedAt) : null;

  if (!cloudEnabled) {
    return (
      <div className="page-in">
        <PageHeader title="Account and sync">Sign-in isn’t switched on for this copy of PM Path. Everything still works and is saved in this browser.</PageHeader>
        <Card className="grid items-center gap-6 p-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <CardTitle icon={<CloudOff size={18} aria-hidden />}>Cloud sync is off</CardTitle>
            <p>
              To move your progress between devices today, use <strong>Settings → Export JSON</strong> on one device and <strong>Import JSON</strong> on the other.
            </p>
            <p className="text-sm text-muted">If you run your own copy of PM Path, the README explains how to connect a free Firebase project to switch on sign-in.</p>
          </div>
          <SyncIllustration className="w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-in">
      <PageHeader
        title="Account and sync"
        kicker={
          <Chip color={meta.color}>
            {status === 'synced' ? (
              <Check size={13} aria-hidden />
            ) : status === 'saving' || status === 'connecting' ? (
              <Loader size={13} className="spin" aria-hidden />
            ) : (
              <Cloud size={13} aria-hidden />
            )}
            {meta.label}
          </Chip>
        }
      >
        Sign in to keep your progress in step across your laptop, phone and any other device. Signing in is optional: PM Path works fully without it.
      </PageHeader>

      {error && (
        <div role="alert" className="nb-card shake mb-6 bg-pink p-4">
          {error}
        </div>
      )}

      {status === 'conflict' && conflict && (
        <section aria-labelledby="conflict-h" className="mb-8">
          <Callout kind="warning" title="Two different copies found">
            <span id="conflict-h">This device and your account both have progress, and they don’t match. Pick the one to keep. The other copy will be replaced everywhere.</span>
          </Callout>
          <div className="stagger mt-4 grid gap-4 md:grid-cols-2">
            <SummaryCard title="This device" icon={<Laptop size={18} aria-hidden />} s={conflict.local} onPick={() => void resolveConflict('device')} color="butter" />
            <SummaryCard
              title="Your account (cloud)"
              icon={<Cloud size={18} aria-hidden />}
              s={conflict.cloud}
              when={new Date(conflict.cloudUpdatedAt).toLocaleString('en-IN')}
              onPick={() => void resolveConflict('cloud')}
              color="sky"
            />
          </div>
          <p className="mt-3 text-sm text-muted">Not sure? Use Settings → Export JSON first to save this device’s copy as a file.</p>
        </section>
      )}

      {user ? (
        <div className="stagger grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="space-y-5 p-6">
            <div className="flex items-center gap-4">
              {user.photo ? (
                <img src={user.photo} alt="" width={56} height={56} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full border-2 border-line" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-line bg-lavender font-display text-xl font-bold">
                  {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">{user.name || 'Signed in'}</p>
                <p className="truncate text-sm text-muted">{user.email}</p>
              </div>
            </div>
            <div className="rounded-[10px] border-2 border-line p-4">
              <p className="flex items-center gap-2 font-display font-semibold">
                <span
                  className={cx(
                    'inline-block h-2.5 w-2.5 rounded-full border border-line',
                    status === 'synced' ? 'bg-mint' : status === 'error' || status === 'conflict' ? 'bg-pink' : 'pulse-dot bg-butter',
                  )}
                  aria-hidden
                />
                {meta.label}
              </p>
              <p className="mt-1 text-sm text-muted">{ago ? `Last synced ${ago}.` : 'Changes save to your account a moment after you make them.'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void syncNow()} disabled={status === 'connecting' || status === 'saving'}>
                <RefreshCw size={16} aria-hidden className={status === 'connecting' ? 'spin' : undefined} /> Sync now
              </Button>
              <Button onClick={() => void signOut()}>
                <LogOut size={16} aria-hidden /> Sign out
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Delete your progress from the cloud and sign out? The copy on this device stays. Other devices keep their own copies until you clear them.'))
                    void deleteCloudData();
                }}
              >
                <Trash2 size={16} aria-hidden /> Delete cloud copy
              </Button>
            </div>
            <p className="text-sm text-muted">Signing out keeps your progress on this device. Your Gemini API key (if any) never leaves this device.</p>
          </Card>
          <Card color="sky" className="space-y-3 p-6">
            <SyncIllustration className="w-full" />
            <p className="font-display font-bold">On another device?</p>
            <p className="text-sm">Open PM Path there and sign in with the same account. Your progress appears in a few seconds.</p>
          </Card>
        </div>
      ) : (
        <div className="stagger grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="space-y-6 p-6">
            <div>
              <CardTitle>Sign in</CardTitle>
              <p className="mt-1 text-sm text-muted">Use the same account on every device.</p>
            </div>
            <Button variant="primary" className="w-full sm:w-auto" disabled={busy || !ready} onClick={() => void signInWithGoogle()}>
              <GoogleMark /> {ready ? 'Continue with Google' : 'Loading sign-in…'}
            </Button>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted" aria-hidden>
              <span className="h-0.5 flex-1 bg-line/20" /> or <span className="h-0.5 flex-1 bg-line/20" />
            </div>
            {sent ? (
              <div role="status" className="nb-card bounce-in bg-mint p-4">
                <p className="font-display font-bold">Check your inbox</p>
                <p className="text-sm">We sent a sign-in link to {email}. Open it on this device to finish signing in.</p>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (linkPending) {
                    setBusy(true);
                    const ok = await completeEmailLink(email.trim(), window.location.href);
                    setBusy(false);
                    if (ok) {
                      setLinkPending(false);
                      window.history.replaceState(null, '', window.location.pathname);
                    }
                    return;
                  }
                  setBusy(true);
                  const url = `${window.location.origin}${import.meta.env.BASE_URL}account`;
                  const ok = await sendEmailLink(email.trim(), url);
                  setBusy(false);
                  if (ok) setSent(true);
                }}
              >
                <Field label={linkPending ? 'Confirm your email to finish signing in' : 'Email me a sign-in link'}>
                  {(id) => <Input id={id} type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />}
                </Field>
                <Button type="submit" disabled={busy || !email.includes('@')}>
                  <Mail size={16} aria-hidden /> {linkPending ? 'Finish signing in' : busy ? 'Sending…' : 'Send link'}
                </Button>
              </form>
            )}
          </Card>
          <Card color="lavender" className="space-y-4 p-6">
            <SyncIllustration className="w-full" />
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <Smartphone size={16} className="mt-1 flex-none" aria-hidden /> Pick up on your phone where you left off on your laptop.
              </li>
              <li className="flex gap-2">
                <ShieldCheck size={16} className="mt-1 flex-none" aria-hidden /> Only you can read your progress. Your API key is never uploaded.
              </li>
              <li className="flex gap-2">
                <CloudOff size={16} className="mt-1 flex-none" aria-hidden /> Works offline too: changes sync when you reconnect.
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function timeAgo(ms: number) {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h} h ago`;
}
