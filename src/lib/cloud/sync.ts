import { create } from 'zustand';
import type { ProgressData } from '../../data/types';
import { useStore, getData } from '../../store/useStore';
import { cloudEnabled } from './config';
import { decide, fromPayload, summarize, toPayload, type ProgressSummary, type SyncMeta } from './decide';
import type { CloudBackend, CloudUser, RemoteDoc } from './types';
import { uid as makeId } from '../uid';

export type SyncStatus = 'off' | 'signed-out' | 'connecting' | 'synced' | 'saving' | 'offline' | 'error' | 'conflict';

export interface Conflict {
  local: ProgressSummary;
  cloud: ProgressSummary;
  cloudUpdatedAt: number;
}

interface SyncState {
  status: SyncStatus;
  user: CloudUser | null;
  lastSyncedAt: number | null;
  error: string | null;
  conflict: Conflict | null;
}

export const useSync = create<SyncState>(() => ({
  status: cloudEnabled ? 'signed-out' : 'off',
  user: null,
  lastSyncedAt: null,
  error: null,
  conflict: null,
}));

const META_KEY = 'pm-path-sync';
const SIGNED_IN_KEY = 'pm-path-cloud-signed-in';
export const EMAIL_KEY = 'pm-path-email-for-signin';
/** Firestore documents are capped at 1 MiB. */
const MAX_BYTES = 950_000;
const SAVE_DELAY = 1500;

function readMeta(): SyncMeta {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY) || 'null');
    if (m && typeof m.deviceId === 'string') return { uid: null, localUpdatedAt: 0, syncedAt: 0, ...m };
  } catch {
    /* ignore */
  }
  return { deviceId: makeId(), uid: null, localUpdatedAt: 0, syncedAt: 0 };
}
function writeMeta(patch: Partial<SyncMeta>) {
  meta = { ...meta, ...patch };
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

let meta: SyncMeta = typeof localStorage !== 'undefined' ? readMeta() : { deviceId: 'test', uid: null, localUpdatedAt: 0, syncedAt: 0 };
let backend: CloudBackend | null = null;
let backendPromise: Promise<CloudBackend> | null = null;
let unsubRemote: (() => void) | null = null;
let applyingRemote = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSavedPayload = '';
let pendingRemote: RemoteDoc | null = null;
let started = false;

/** Lets tests inject a fake backend. */
export function __setBackend(b: CloudBackend | null) {
  backend = b;
  backendPromise = b ? Promise.resolve(b) : null;
}

export function loadBackend(): Promise<CloudBackend> {
  if (!backendPromise) {
    backendPromise = import('./firebaseBackend').then((m) => {
      backend = m.backend;
      backend.onAuth(handleAuth);
      return backend;
    });
  }
  return backendPromise;
}

const set = (p: Partial<SyncState>) => useSync.setState(p);
const isOffline = (): boolean => typeof navigator !== 'undefined' && navigator.onLine === false;
const friendly = (e: unknown) => {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) return 'Sign-in was cancelled.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the Google sign-in window. Tap “Continue with Google” again, allow pop-ups for this site, or use the email link below.';
  if (code.includes('network') || code === 'unavailable') return 'You seem to be offline. Your progress is safe on this device and will sync when you’re back online.';
  if (code.includes('permission-denied')) return 'The cloud refused this request. Try signing out and in again.';
  if (code.includes('unauthorized-domain')) return 'This website address isn’t allowed to sign in yet. The site owner needs to add it in Firebase → Authentication → Settings → Authorized domains.';
  if (code.includes('invalid-action-code') || code.includes('expired-action-code')) return 'That sign-in link has expired or was already used. Request a new one.';
  return (e as Error)?.message || 'Something went wrong.';
};

function applyRemote(r: RemoteDoc) {
  applyingRemote = true;
  try {
    useStore.getState().replaceAll(fromPayload(r.data, getData()));
  } finally {
    applyingRemote = false;
  }
  lastSavedPayload = toPayload(getData());
  writeMeta({ syncedAt: r.updatedAt, localUpdatedAt: r.updatedAt });
  set({ status: 'synced', lastSyncedAt: Date.now(), error: null });
}

async function upload(force = false) {
  const u = useSync.getState().user;
  if (!backend || !u) return;
  if (useSync.getState().status === 'conflict' && !force) return;
  const payload = toPayload(getData());
  if (payload === lastSavedPayload && !force) {
    set({ status: isOffline() ? 'offline' : 'synced' });
    return;
  }
  if (payload.length > MAX_BYTES) {
    set({
      status: 'error',
      error: 'Your progress is too large to sync (over 1 MB), usually because of very long template drafts. Trim some drafts, or use Export JSON to move it.',
    });
    return;
  }
  if (isOffline()) {
    set({ status: 'offline' });
    return;
  }
  const updatedAt = Date.now();
  set({ status: 'saving' });
  try {
    await backend.save(u.uid, {
      data: payload,
      updatedAt,
      deviceId: meta.deviceId,
    });
    lastSavedPayload = payload;
    writeMeta({ syncedAt: updatedAt, uid: u.uid });
    set({ status: 'synced', lastSyncedAt: Date.now(), error: null });
  } catch (e) {
    set({ status: isOffline() ? 'offline' : 'error', error: friendly(e) });
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void upload();
  }, SAVE_DELAY);
}

function onRemoteChange(r: RemoteDoc | null) {
  if (!r || r.deviceId === meta.deviceId || r.updatedAt <= meta.syncedAt) return;
  // Another device saved. If we have unsaved local edits, ours will be uploaded next and win.
  if (saveTimer || meta.localUpdatedAt > meta.syncedAt) {
    pendingRemote = r;
    return;
  }
  applyRemote(r);
}

async function handleAuth(user: CloudUser | null) {
  unsubRemote?.();
  unsubRemote = null;
  if (!user) {
    try {
      localStorage.removeItem(SIGNED_IN_KEY);
    } catch {
      /* ignore */
    }
    set({ user: null, status: 'signed-out', conflict: null, error: null });
    return;
  }
  try {
    localStorage.setItem(SIGNED_IN_KEY, '1');
  } catch {
    /* ignore */
  }
  set({ user, status: 'connecting', error: null });
  try {
    await reconcile(user);
  } catch (e) {
    set({ status: isOffline() ? 'offline' : 'error', error: friendly(e) });
  }
}

async function reconcile(user: CloudUser) {
  if (!backend) return;
  const remote = await backend.load(user.uid);
  const local = getData();
  const remoteData = remote ? fromPayload(remote.data, local) : null;
  const d = decide(local, meta, user.uid, remote && remoteData ? { updatedAt: remote.updatedAt, data: remoteData } : null);
  if (d === 'download' && remote) applyRemote(remote);
  else if (d === 'upload') {
    writeMeta({ uid: user.uid });
    await upload(true);
  } else if (d === 'in-sync') {
    lastSavedPayload = toPayload(local);
    writeMeta({
      uid: user.uid,
      syncedAt: remote?.updatedAt ?? meta.syncedAt,
      localUpdatedAt: remote?.updatedAt ?? meta.localUpdatedAt,
    });
    set({ status: 'synced', lastSyncedAt: Date.now() });
  } else if (remoteData && remote) {
    set({
      status: 'conflict',
      conflict: {
        local: summarize(local),
        cloud: summarize(remoteData),
        cloudUpdatedAt: remote.updatedAt,
      },
    });
  }
  unsubRemote = backend.subscribe(user.uid, onRemoteChange);
}

/** Resolve a first-sign-in conflict by choosing which copy to keep. */
export async function resolveConflict(keep: 'cloud' | 'device') {
  const u = useSync.getState().user;
  if (!backend || !u) return;
  set({ conflict: null, status: 'connecting' });
  writeMeta({ uid: u.uid });
  if (keep === 'cloud') {
    const r = await backend.load(u.uid);
    if (r) applyRemote(r);
  } else {
    writeMeta({ localUpdatedAt: Date.now() });
    await upload(true);
  }
}

export async function syncNow() {
  const u = useSync.getState().user;
  if (!backend || !u) return;
  set({ status: 'connecting' });
  try {
    await reconcile(u);
  } catch (e) {
    set({ status: 'error', error: friendly(e) });
  }
}

/** True once the Firebase code has downloaded, so a tap can open the Google window immediately. */
export function backendReady() {
  return backend !== null;
}

/**
 * Must be called straight from a tap. Safari (especially on iPhone) only allows the Google
 * window to open if nothing is awaited between the tap and opening it, so the Firebase code
 * is preloaded when the Account page opens and used synchronously here.
 */
export function signInWithGoogle(): Promise<void> {
  set({ error: null });
  const run = (b: CloudBackend) =>
    b.signInGoogle().catch((e) => {
      set({ error: friendly(e) });
    });
  if (backend) return run(backend);
  return loadBackend().then(run, (e) => set({ error: friendly(e) }));
}

export async function sendEmailLink(email: string, returnUrl: string): Promise<boolean> {
  set({ error: null });
  try {
    const b = await loadBackend();
    await b.sendEmailLink(email, returnUrl);
    localStorage.setItem(EMAIL_KEY, email);
    return true;
  } catch (e) {
    set({ error: friendly(e) });
    return false;
  }
}

export async function isEmailLink(url: string) {
  if (!cloudEnabled || !/[?&]oobCode=/.test(url)) return false;
  return (await loadBackend()).isEmailLink(url);
}

export async function completeEmailLink(email: string, url: string): Promise<boolean> {
  try {
    await (await loadBackend()).completeEmailLink(email, url);
    localStorage.removeItem(EMAIL_KEY);
    return true;
  } catch (e) {
    set({ error: friendly(e) });
    return false;
  }
}

export async function signOut() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    await upload();
  }
  await backend?.signOut();
}

export async function deleteCloudData() {
  const u = useSync.getState().user;
  if (!backend || !u) return;
  await backend.remove(u.uid);
  writeMeta({ syncedAt: 0 });
  lastSavedPayload = '';
  await backend.signOut();
}

/** Watch local edits and push them; restore the session if this device was signed in. */
export function startSync() {
  if (started) return;
  started = true;
  let prev: ProgressData = getData();
  useStore.subscribe(() => {
    const next = getData();
    const changed = (Object.keys(next) as (keyof ProgressData)[]).some((k) => next[k] !== prev[k]);
    prev = next;
    if (!changed || applyingRemote) return;
    writeMeta({ localUpdatedAt: Date.now() });
    const st = useSync.getState();
    if (st.user && st.status !== 'conflict') scheduleSave();
  });
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      if (useSync.getState().user) void syncNow();
    });
    window.addEventListener('offline', () => {
      if (useSync.getState().user) set({ status: 'offline' });
    });
    // Flush a pending save when the tab is hidden or closed.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
        void upload();
      }
    });
  }
  if (!cloudEnabled) return;
  let signedIn = false;
  try {
    signedIn = localStorage.getItem(SIGNED_IN_KEY) === '1';
  } catch {
    /* ignore */
  }
  if (signedIn) {
    set({ status: 'connecting' });
    void loadBackend();
  }
  // Apply a cloud change that arrived while we had unsaved edits, once those are saved.
  useSync.subscribe((s) => {
    if (s.status === 'synced' && pendingRemote) {
      const r = pendingRemote;
      pendingRemote = null;
      if (r.updatedAt > meta.syncedAt) applyRemote(r);
    }
  });
}

/** Test helper. */
export function __reset() {
  started = false;
  lastSavedPayload = '';
  pendingRemote = null;
  meta = { deviceId: 'test-device', uid: null, localUpdatedAt: 0, syncedAt: 0 };
  useSync.setState({
    status: 'signed-out',
    user: null,
    lastSyncedAt: null,
    error: null,
    conflict: null,
  });
}

export const __internals = {
  handleAuth,
  upload,
  onRemoteChange,
  getMeta: () => meta,
};
