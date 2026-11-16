import type { ProgressData } from '../../data/types';
import { defaultData, normalize } from '../../store/useStore';

/** Per-device sync bookkeeping, kept in localStorage (never synced). */
export interface SyncMeta {
  deviceId: string;
  /** Account this device last synced with. */
  uid: string | null;
  /** When this device last changed its progress (ms). */
  localUpdatedAt: number;
  /** `updatedAt` of the cloud copy this device last uploaded or downloaded (ms). */
  syncedAt: number;
}

export type Decision = 'upload' | 'download' | 'in-sync' | 'conflict';

/** Strip device-only fields before upload. The Gemini API key never leaves the device. */
export function toPayload(d: ProgressData): string {
  return JSON.stringify({ ...d, settings: { ...d.settings, apiKey: '' } });
}

/** Parse a cloud copy, keeping this device's own API key. */
export function fromPayload(payload: string, local: ProgressData): ProgressData {
  const parsed = normalize(JSON.parse(payload));
  return {
    ...parsed,
    settings: { ...parsed.settings, apiKey: local.settings.apiKey },
  };
}

/** True when there is no learning progress yet (settings alone don't count). */
export function isEmpty(d: ProgressData): boolean {
  const strip = (x: ProgressData) =>
    JSON.stringify({
      ...x,
      settings: null,
      activeTimer: null,
      celebratedWeeks: [],
    });
  return strip(d) === strip(defaultData());
}

function sameProgress(a: ProgressData, b: ProgressData): boolean {
  const strip = (x: ProgressData) =>
    JSON.stringify({
      ...x,
      settings: { ...x.settings, apiKey: '' },
      activeTimer: null,
    });
  return strip(a) === strip(b);
}

export function decide(local: ProgressData, meta: SyncMeta, uid: string, remote: { updatedAt: number; data: ProgressData } | null): Decision {
  if (!remote) return 'upload';
  if (isEmpty(local)) return isEmpty(remote.data) && meta.localUpdatedAt > remote.updatedAt ? 'upload' : 'download';
  if (sameProgress(local, remote.data)) return 'in-sync';
  if (isEmpty(remote.data)) return 'upload';
  if (meta.uid === uid) {
    const localChanged = meta.localUpdatedAt > meta.syncedAt;
    const remoteChanged = remote.updatedAt > meta.syncedAt;
    if (localChanged && !remoteChanged) return 'upload';
    if (remoteChanged && !localChanged) return 'download';
    if (!localChanged && !remoteChanged) return 'in-sync';
  }
  return 'conflict';
}

export interface ProgressSummary {
  lessons: number;
  hours: number;
  applications: number;
  lastActive: string | null;
}

export function summarize(d: ProgressData): ProgressSummary {
  const days = Object.keys(d.activity).sort();
  return {
    lessons: Object.values(d.topics).filter((t) => t?.done).length,
    hours: Math.round((d.timeLogs.reduce((a, l) => a + l.minutes, 0) / 60) * 10) / 10,
    applications: d.applications.length,
    lastActive: days.length ? days[days.length - 1] : null,
  };
}
