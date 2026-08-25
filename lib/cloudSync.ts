'use client';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { getDeviceUserId, getFirebaseDb, isFirebaseConfigured } from './firebase';

// Every piece of app state that should persist to the cloud is stored in
// localStorage under a `wk_` key (see app/page.tsx, WorkoutScreen, BodyWeightTracker,
// WeightLogger, ProgressScreen). To make a NEW piece of state cloud-synced, just keep
// using that convention — write it with localStorage.setItem('wk_whatever', ...) — and
// it will be picked up automatically. No changes needed here.
const KEY_PREFIX = 'wk_';
const LAST_SYNC_KEY = 'wk_cloud_last_synced_at';
const DEBOUNCE_MS = 1500;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;
let patched = false;
let initialized = false;

function snapshotLocalState(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX) && key !== LAST_SYNC_KEY) {
      const value = localStorage.getItem(key);
      if (value !== null) snapshot[key] = value;
    }
  }
  return snapshot;
}

async function pushNow() {
  if (!isFirebaseConfigured) return;
  const db = getFirebaseDb();
  const uid = await getDeviceUserId();
  if (!db || !uid) return;
  try {
    await setDoc(doc(db, 'appState', uid), {
      data: snapshotLocalState(),
      updatedAt: serverTimestamp(),
    });
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  } catch (err) {
    console.warn('[cloudSync] push failed', err);
  }
}

function schedulePush() {
  if (applyingRemote) return; // don't echo a remote pull straight back up
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, DEBOUNCE_MS);
}

// Any wk_* write, anywhere in the app (now or in the future), triggers a debounced
// cloud push automatically — no need to wire up new state individually.
function patchLocalStorage() {
  if (patched) return;
  patched = true;
  const rawSetItem = localStorage.setItem.bind(localStorage);
  const rawRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = (key: string, value: string) => {
    rawSetItem(key, value);
    if (key.startsWith(KEY_PREFIX) && key !== LAST_SYNC_KEY) schedulePush();
  };
  localStorage.removeItem = (key: string) => {
    rawRemoveItem(key);
    if (key.startsWith(KEY_PREFIX) && key !== LAST_SYNC_KEY) schedulePush();
  };
}

async function pullAndMerge() {
  const db = getFirebaseDb();
  const uid = await getDeviceUserId();
  if (!db || !uid) return;

  try {
    const snap = await getDoc(doc(db, 'appState', uid));
    if (!snap.exists()) {
      await pushNow();
      return;
    }

    const remote = snap.data() as { data?: Record<string, string>; updatedAt?: Timestamp };
    const remoteMillis = remote.updatedAt?.toMillis() ?? 0;
    const localMillis = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);

    if (remoteMillis > localMillis && remote.data) {
      applyingRemote = true;
      for (const [key, value] of Object.entries(remote.data)) {
        localStorage.setItem(key, value);
      }
      localStorage.setItem(LAST_SYNC_KEY, String(remoteMillis));
      applyingRemote = false;
    } else {
      await pushNow();
    }
  } catch (err) {
    console.warn('[cloudSync] pull failed', err);
  }
}

// Call once on app startup. Resolves once any newer cloud data has been merged into
// localStorage, so callers should wait for it before reading localStorage into state.
export function initCloudSync(): Promise<void> {
  if (!isFirebaseConfigured) return Promise.resolve();
  if (initialized) return Promise.resolve();
  initialized = true;
  patchLocalStorage();
  return pullAndMerge();
}
