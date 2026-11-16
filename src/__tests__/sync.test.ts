import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defaultData, useStore, getData } from '../store/useStore';
import { decide, fromPayload, isEmpty, toPayload, type SyncMeta } from '../lib/cloud/decide';
import { __internals, __reset, __setBackend, resolveConflict, useSync } from '../lib/cloud/sync';
import type { CloudBackend, RemoteDoc } from '../lib/cloud/types';
import { LANDING_STATS } from '../pages/landingStats';
import { lessonIds } from '../lib/content';
import { TEMPLATES } from '../lib/templates';
import { FRAMEWORKS } from '../data/frameworks';
import { QUESTIONS } from '../data/questions';
import { TOOLS } from '../tools/registry';

const withLesson = () => {
  const d = defaultData();
  d.topics = { 'w1-pm-role': { done: true } } as typeof d.topics;
  d.activity = { '2026-11-02': 3 };
  return d;
};
const meta = (p: Partial<SyncMeta> = {}): SyncMeta => ({ deviceId: 'a', uid: null, localUpdatedAt: 0, syncedAt: 0, ...p });

describe('decide', () => {
  it('uploads when the cloud is empty', () => {
    expect(decide(withLesson(), meta(), 'u1', null)).toBe('upload');
  });
  it('downloads onto a fresh device', () => {
    expect(decide(defaultData(), meta(), 'u1', { updatedAt: 10, data: withLesson() })).toBe('download');
  });
  it('is in sync when progress matches (ignoring the API key)', () => {
    const local = withLesson();
    local.settings.apiKey = 'secret';
    expect(decide(local, meta(), 'u1', { updatedAt: 10, data: withLesson() })).toBe('in-sync');
  });
  it('asks the user the first time both copies differ', () => {
    const remote = withLesson();
    remote.applications = [{ id: 'x' } as never];
    expect(decide(withLesson(), meta(), 'u1', { updatedAt: 10, data: remote })).toBe('conflict');
  });
  it('uses timestamps for a device that has synced this account before', () => {
    const remote = withLesson();
    remote.applications = [{ id: 'x' } as never];
    expect(decide(withLesson(), meta({ uid: 'u1', syncedAt: 10, localUpdatedAt: 20 }), 'u1', { updatedAt: 10, data: remote })).toBe('upload');
    expect(decide(withLesson(), meta({ uid: 'u1', syncedAt: 10, localUpdatedAt: 10 }), 'u1', { updatedAt: 30, data: remote })).toBe('download');
    expect(decide(withLesson(), meta({ uid: 'u1', syncedAt: 10, localUpdatedAt: 20 }), 'u1', { updatedAt: 30, data: remote })).toBe('conflict');
  });
  it('treats settings-only data as empty', () => {
    const d = defaultData();
    d.settings.name = 'Asha';
    expect(isEmpty(d)).toBe(true);
    expect(isEmpty(withLesson())).toBe(false);
  });
  it('never uploads the API key and keeps the local one on download', () => {
    const d = withLesson();
    d.settings.apiKey = 'AIza-secret';
    const payload = toPayload(d);
    expect(payload).not.toContain('AIza-secret');
    const local = defaultData();
    local.settings.apiKey = 'mine';
    expect(fromPayload(payload, local).settings.apiKey).toBe('mine');
  });
});

function fakeBackend(initial: RemoteDoc | null = null) {
  let doc = initial;
  let listener: ((d: RemoteDoc | null) => void) | null = null;
  const b: CloudBackend & { doc: () => RemoteDoc | null; push: (d: RemoteDoc) => void } = {
    onAuth: () => () => {},
    signInGoogle: async () => {},
    sendEmailLink: async () => {},
    isEmailLink: () => false,
    completeEmailLink: async () => {},
    signOut: async () => {},
    load: async () => doc,
    save: vi.fn(async (_uid: string, d: RemoteDoc) => {
      doc = d;
    }),
    remove: async () => {
      doc = null;
    },
    subscribe: (_uid, cb) => {
      listener = cb;
      return () => {
        listener = null;
      };
    },
    doc: () => doc,
    push: (d) => {
      doc = d;
      listener?.(d);
    },
  };
  return b;
}

const user = { uid: 'u1', email: 'a@example.com', name: 'A', photo: null };

describe('sync engine', () => {
  beforeEach(() => {
    __reset();
    useStore.getState().reset();
  });

  it('uploads local progress on first sign-in when the cloud is empty', async () => {
    useStore.getState().replaceAll(withLesson());
    const b = fakeBackend();
    __setBackend(b);
    await __internals.handleAuth(user);
    expect(useSync.getState().status).toBe('synced');
    expect(JSON.parse(b.doc()!.data).topics['w1-pm-role'].done).toBe(true);
  });

  it('downloads cloud progress onto an empty device', async () => {
    const b = fakeBackend({ data: toPayload(withLesson()), updatedAt: 50, deviceId: 'other' });
    __setBackend(b);
    await __internals.handleAuth(user);
    expect(getData().topics['w1-pm-role']?.done).toBe(true);
    expect(useSync.getState().status).toBe('synced');
  });

  it('shows a conflict and lets the user keep the cloud copy', async () => {
    useStore.getState().replaceAll(withLesson());
    const remote = withLesson();
    remote.applications = [{ id: 'app1', company: 'Acme', role: 'APM', stage: 'applied', referral: false, notes: '', link: '', updatedAt: '2026-11-01' } as never];
    const b = fakeBackend({ data: toPayload(remote), updatedAt: 50, deviceId: 'other' });
    __setBackend(b);
    await __internals.handleAuth(user);
    expect(useSync.getState().status).toBe('conflict');
    expect(useSync.getState().conflict?.cloud.applications).toBe(1);
    await resolveConflict('cloud');
    expect(getData().applications).toHaveLength(1);
    expect(useSync.getState().status).toBe('synced');
  });

  it('applies changes pushed from another device', async () => {
    const b = fakeBackend({ data: toPayload(withLesson()), updatedAt: 50, deviceId: 'other' });
    __setBackend(b);
    await __internals.handleAuth(user);
    const next = withLesson();
    next.outreach = { '2026-11-03': 4 };
    b.push({ data: toPayload(next), updatedAt: 90, deviceId: 'other' });
    expect(getData().outreach['2026-11-03']).toBe(4);
  });

  it('ignores echoes of its own saves', async () => {
    useStore.getState().replaceAll(withLesson());
    const b = fakeBackend();
    __setBackend(b);
    await __internals.handleAuth(user);
    const saved = b.doc()!;
    const before = getData();
    b.push(saved);
    expect(getData()).toEqual(before);
  });
});

describe('landing page numbers', () => {
  it('match the real content', () => {
    const v = Object.fromEntries(LANDING_STATS.map((s) => [s.label, s.value]));
    const guides = readdirSync(join(__dirname, '../content/tools')).filter((f) => f.endsWith('.md')).length;
    expect(v['Lessons']).toBe(lessonIds().length);
    expect(v['Tool guides']).toBe(guides);
    expect(v['Practice tools']).toBe(TOOLS.length);
    expect(v['Templates']).toBe(TEMPLATES.length);
    expect(v['Frameworks']).toBe(FRAMEWORKS.length);
    expect(v['Interview questions']).toBe(QUESTIONS.length);
  });
});
