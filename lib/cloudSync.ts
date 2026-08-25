'use client';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { getDeviceUserId, getFirebaseDb, isFirebaseConfigured } from './firebase';
import { profileKeyPrefix, type ProfileId } from './profiles';

// One Firestore doc per profile (appState/{profileId}), not per device — that's what lets
// either person view the other's progress from any device. Every key under that profile's
// `wk_{id}_` prefix in localStorage is synced automatically; a new piece of state just
// needs to be stored under that prefix (see lib/profiles.ts#profileKey) to be included,
// no changes needed here.
const DEBOUNCE_MS = 1500;

function lastSyncedKey(prefix: string) {
  return `${prefix}cloud_last_synced_at`;
}

function snapshotLocalState(prefix: string): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && key !== lastSyncedKey(prefix)) {
      const value = localStorage.getItem(key);
      if (value !== null) snapshot[key] = value;
    }
  }
  return snapshot;
}

async function pushNow(profileId: ProfileId, prefix: string) {
  if (!isFirebaseConfigured) return;
  const db = getFirebaseDb();
  const uid = await getDeviceUserId();
  if (!db || !uid) return;
  try {
    await setDoc(doc(db, 'appState', profileId), {
      data: snapshotLocalState(prefix),
      updatedAt: serverTimestamp(),
    });
    localStorage.setItem(lastSyncedKey(prefix), String(Date.now()));
  } catch (err) {
    console.warn('[cloudSync] push failed', err);
  }
}

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const applyingRemote = new Set<string>();
// prefix -> profileId, only for the profile this device is currently allowed to edit.
const writablePrefixes = new Map<string, ProfileId>();
let patched = false;

function schedulePush(profileId: ProfileId, prefix: string) {
  if (applyingRemote.has(prefix)) return; // don't echo a remote pull straight back up
  const existing = pushTimers.get(prefix);
  if (existing) clearTimeout(existing);
  pushTimers.set(prefix, setTimeout(() => pushNow(profileId, prefix), DEBOUNCE_MS));
}

function patchLocalStorageOnce() {
  if (patched) return;
  patched = true;
  const rawSetItem = localStorage.setItem.bind(localStorage);
  const rawRemoveItem = localStorage.removeItem.bind(localStorage);

  const maybeSchedule = (key: string) => {
    for (const [prefix, profileId] of writablePrefixes) {
      if (key.startsWith(prefix) && key !== lastSyncedKey(prefix)) schedulePush(profileId, prefix);
    }
  };

  localStorage.setItem = (key: string, value: string) => {
    rawSetItem(key, value);
    maybeSchedule(key);
  };
  localStorage.removeItem = (key: string) => {
    rawRemoveItem(key);
    maybeSchedule(key);
  };
}

async function pullProfile(profileId: ProfileId, prefix: string) {
  const db = getFirebaseDb();
  const uid = await getDeviceUserId();
  if (!db || !uid) return;

  try {
    const snap = await getDoc(doc(db, 'appState', profileId));
    if (!snap.exists()) {
      // nothing in the cloud yet for this profile — if it's ours, seed it.
      if (writablePrefixes.has(prefix)) await pushNow(profileId, prefix);
      return;
    }

    const remote = snap.data() as { data?: Record<string, string>; updatedAt?: Timestamp };
    if (!remote.data) return;
    const remoteMillis = remote.updatedAt?.toMillis() ?? 0;
    const localMillis = Number(localStorage.getItem(lastSyncedKey(prefix)) || 0);
    if (remoteMillis <= localMillis) return;

    applyingRemote.add(prefix);
    for (const [key, value] of Object.entries(remote.data)) {
      localStorage.setItem(key, value);
    }
    localStorage.setItem(lastSyncedKey(prefix), String(remoteMillis));
    applyingRemote.delete(prefix);
  } catch (err) {
    console.warn('[cloudSync] pull failed', err);
  }
}

// Call whenever the active/viewed profile changes (including on first load). Pulls that
// profile's latest cloud data into its namespaced localStorage keys before resolving, so
// callers should wait for it before reading that profile's state.
//
// canWrite = true for the device owner's own profile: future wk_{id}_ writes get pushed
// to the cloud automatically. false for read-only viewing of someone else's profile: this
// device only ever pulls their data, never pushes it.
export async function syncProfile(profileId: ProfileId, canWrite: boolean): Promise<void> {
  if (!isFirebaseConfigured) return;
  const prefix = profileKeyPrefix(profileId);
  patchLocalStorageOnce();
  if (canWrite) writablePrefixes.set(prefix, profileId);
  else writablePrefixes.delete(prefix);
  await pullProfile(profileId, prefix);
}
