'use client';
import { useState, useEffect } from 'react';
import WorkoutScreen from '@/components/WorkoutScreen';
import ProgressScreen from '@/components/ProgressScreen';
import TipsScreen from '@/components/TipsScreen';
import BottomNav from '@/components/BottomNav';
import { PAIN_AREAS, EQUIPMENT_ITEMS, ALL_EQUIPMENT, type ExerciseInfo, type PainArea, type EquipmentItem } from '@/data/workoutData';
import { syncProfile } from '@/lib/cloudSync';
import { PROFILES, isProfileId, profileKey, profileLabel, type ProfileId } from '@/lib/profiles';

type Screen = 'workout' | 'progress' | 'tips';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export const LEVEL_CONFIG: Record<Level, { label: string; desc: string; restMultiplier: number; color: string }> = {
  beginner: {
    label: 'Beginner',
    desc: 'Just started · Longer rest (you need it!)',
    restMultiplier: 1.5,
    color: 'text-[#4ade80]',
  },
  intermediate: {
    label: 'Intermediate',
    desc: '3–12 months training · Standard rest',
    restMultiplier: 1.0,
    color: 'text-[#facc15]',
  },
  advanced: {
    label: 'Advanced',
    desc: '1+ year training · Shorter rest',
    restMultiplier: 0.7,
    color: 'text-[#f87171]',
  },
};

const MY_PROFILE_KEY = 'wk_my_profile_id';
const VIEWING_PROFILE_KEY = 'wk_viewing_profile_id';

function useLocalStorage<T>(profileId: ProfileId, key: string, initial: T) {
  const storageKey = profileKey(profileId, key);
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  const set = (v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return [value, set, loaded] as const;
}

export interface StreakData {
  count: number;
  lastDate: string;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

interface WorkoutAppProps {
  profileId: ProfileId;
  readOnly: boolean;
  viewerLabel: string;
  onSwitchProfile: (id: ProfileId) => void;
  onResetIdentity: () => void;
}

function WorkoutApp({ profileId, readOnly, viewerLabel, onSwitchProfile, onResetIdentity }: WorkoutAppProps) {
  const [screen, setScreen] = useState<Screen>('workout');
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showPainPicker, setShowPainPicker] = useState(false);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [checked, setChecked, checkedLoaded] = useLocalStorage<Record<string, boolean>>(profileId, 'checked', {});
  const [completedSessions, setCompletedSessions, sessionsLoaded] = useLocalStorage<number[]>(profileId, 'sessions_done', []);
  const [customExercises, setCustomExercises, customLoaded] = useLocalStorage<Record<string, ExerciseInfo[]>>(profileId, 'custom', {});
  const [level, setLevel, levelLoaded] = useLocalStorage<Level>(profileId, 'level', 'beginner');
  const [streak, setStreak, streakLoaded] = useLocalStorage<StreakData>(profileId, 'streak', { count: 0, lastDate: '' });
  const [painAreas, setPainAreas, painAreasLoaded] = useLocalStorage<PainArea[]>(profileId, 'pain_areas', []);
  const [sessionDates, setSessionDates, sessionDatesLoaded] = useLocalStorage<Record<number, string>>(profileId, 'session_dates', {});
  const [ownedEquipment, setOwnedEquipment, equipmentLoaded] = useLocalStorage<EquipmentItem[]>(profileId, 'equipment', ALL_EQUIPMENT);

  const togglePainArea = (id: PainArea) => {
    setPainAreas((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const toggleEquipment = (id: EquipmentItem) => {
    setOwnedEquipment((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleCheckedChange = (key: string, value: boolean) => {
    setChecked((prev) => ({ ...prev, [key]: value }));
  };

  const handleSessionComplete = (n: number) => {
    if (completedSessions.includes(n)) return;
    setCompletedSessions((prev) => [...prev, n]);
    const today = todayStr();
    setSessionDates((prev) => ({ ...prev, [n]: today }));
    setStreak((prev) => {
      const yesterday = (() => {
        const d = new Date(); d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      })();
      if (prev.lastDate === today) return prev;
      const newCount = prev.lastDate === yesterday ? prev.count + 1 : 1;
      return { count: newCount, lastDate: today };
    });
  };

  const handleAddCustomExercise = (sessionNum: number, ex: ExerciseInfo) => {
    const key = `s${sessionNum}`;
    setCustomExercises((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), ex],
    }));
  };

  const handleRemoveCustomExercise = (sessionNum: number, exName: string) => {
    const key = `s${sessionNum}`;
    setCustomExercises((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter(e => e.name !== exName),
    }));
  };

  const handleReset = () => {
    setChecked({});
    setCompletedSessions([]);
    setCustomExercises({});
    setStreak({ count: 0, lastDate: '' });
    setSessionDates({});
  };

  if (!checkedLoaded || !sessionsLoaded || !customLoaded || !levelLoaded || !streakLoaded || !painAreasLoaded || !sessionDatesLoaded || !equipmentLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[#0f0f0f]">
        <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cfg = LEVEL_CONFIG[level];

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-[#f1f1f1] pb-20 w-full max-w-md">
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-bold text-[17px] tracking-tight">12-Week Transformation</h1>
            <p className="text-[12px] text-[#888] mt-0.5">
              {readOnly ? `Viewing ${viewerLabel}'s progress · read-only` :
               screen === 'workout' ? 'Fat Loss · Muscle · Toned Look' :
               screen === 'progress' ? 'Track Your Journey' : 'Nutrition & Recovery Guide'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {streak.count > 0 && (
              <div className="flex items-center gap-1 bg-[#713f12]/60 border border-[#facc15]/30 rounded-xl px-2.5 py-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-[#facc15] font-bold text-[13px]">{streak.count}</span>
              </div>
            )}
            <button
              onClick={() => setShowProfileSwitcher(true)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 ${readOnly ? 'bg-[#713f12]/60 border border-[#facc15]/30' : 'bg-[#2a2a2a]'}`}
            >
              <span className={`text-[11px] font-bold ${readOnly ? 'text-[#facc15]' : 'text-white'}`}>{viewerLabel}</span>
              <svg className="w-3 h-3 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => !readOnly && setShowLevelPicker(true)}
              disabled={readOnly}
              className={`flex items-center gap-1.5 bg-[#2a2a2a] rounded-xl px-3 py-2 ${readOnly ? 'opacity-50' : ''}`}
            >
              <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
              {!readOnly && (
                <svg className="w-3 h-3 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => !readOnly && setShowPainPicker(true)}
              disabled={readOnly}
              title="Adjust for pain"
              className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${
                painAreas.length > 0 ? 'bg-[#7f1d1d]/40 border border-[#f87171]/40' : 'bg-[#2a2a2a]'
              } ${readOnly ? 'opacity-50' : ''}`}
            >
              <span className="text-sm">🩹</span>
            </button>
            <button
              onClick={() => !readOnly && setShowEquipmentPicker(true)}
              disabled={readOnly}
              title="Your equipment"
              className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${
                ownedEquipment.length < ALL_EQUIPMENT.length ? 'bg-[#1e3a5f]/40 border border-[#7dd3fc]/40' : 'bg-[#2a2a2a]'
              } ${readOnly ? 'opacity-50' : ''}`}
            >
              <span className="text-sm">🎒</span>
            </button>
          </div>
        </div>
      </header>

      {showProfileSwitcher && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
             onClick={() => setShowProfileSwitcher(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-3xl p-6 w-full max-w-lg"
               onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-1">Switch Profile</h2>
            <p className="text-[#888] text-sm mb-5">
              Viewing someone else&apos;s profile is read-only — you can see their progress but can&apos;t change it.
            </p>
            <div className="space-y-3">
              {PROFILES.map((p) => {
                const isActive = p.id === profileId;
                return (
                  <button
                    key={p.id}
                    onClick={() => { onSwitchProfile(p.id); setShowProfileSwitcher(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isActive ? 'border-[#555] bg-[#222]' : 'border-[#2a2a2a] bg-[#111]'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">{p.label}</p>
                    </div>
                    {isActive && <span className="text-[#4ade80] text-lg">✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowProfileSwitcher(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-[#2a2a2a] text-white font-semibold text-sm">
              Done
            </button>
            <button onClick={() => { setShowProfileSwitcher(false); onResetIdentity(); }}
              className="w-full mt-2 py-2.5 text-[#666] text-xs">
              Not you? Reset identity
            </button>
          </div>
        </div>
      )}

      {showLevelPicker && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
             onClick={() => setShowLevelPicker(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-3xl p-6 w-full max-w-lg"
               onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-1">Your Fitness Level</h2>
            <p className="text-[#888] text-sm mb-5">This adjusts your rest times between sets automatically.</p>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-4 mb-5">
              <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">What is rest between sets?</p>
              <p className="text-[#ccc] text-sm leading-relaxed">
                After you finish <span className="text-white font-semibold">Set 1</span> of an exercise, you take a break before doing <span className="text-white font-semibold">Set 2</span>. The timer starts automatically when you tap a set button.
              </p>
              <div className="mt-3 space-y-1 text-xs text-[#888]">
                <p><span className="text-[#4ade80] font-semibold">Beginner:</span> Big lifts → 3 min rest. Smaller exercises → 2 min rest.</p>
                <p><span className="text-[#facc15] font-semibold">Intermediate:</span> Big lifts → 2 min rest. Smaller exercises → 90 sec rest.</p>
                <p><span className="text-[#f87171] font-semibold">Advanced:</span> Big lifts → ~90 sec rest. Smaller exercises → ~60 sec rest.</p>
              </div>
            </div>
            <div className="space-y-3">
              {(Object.keys(LEVEL_CONFIG) as Level[]).map((l) => {
                const c = LEVEL_CONFIG[l];
                const isActive = level === l;
                const restExample = Math.round(120 * c.restMultiplier);
                return (
                  <button
                    key={l}
                    onClick={() => { setLevel(l); setShowLevelPicker(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isActive ? 'border-[#555] bg-[#222]' : 'border-[#2a2a2a] bg-[#111]'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'ring-2 ring-white' : ''}`}
                         style={{ background: l === 'beginner' ? '#4ade80' : l === 'intermediate' ? '#facc15' : '#f87171' }} />
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${c.color}`}>{c.label}</p>
                      <p className="text-[#888] text-xs mt-0.5">{c.desc}</p>
                      <p className="text-[#666] text-[11px] mt-1">
                        Example: Squat rest = <span className="text-white font-semibold">{restExample}s ({Math.floor(restExample/60)}m {restExample % 60 > 0 ? restExample % 60 + 's' : ''})</span>
                      </p>
                    </div>
                    {isActive && <span className="text-[#4ade80] text-lg">✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowLevelPicker(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-[#2a2a2a] text-white font-semibold text-sm">
              Done
            </button>
          </div>
        </div>
      )}

      {showPainPicker && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
             onClick={() => setShowPainPicker(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-3xl p-6 w-full max-w-lg"
               onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-1">Adjust for Pain</h2>
            <p className="text-[#888] text-sm mb-5">
              Toggle any area bothering you — exercises that load it get swapped for a safer option automatically, starting with today&apos;s session. Same number of exercises, just kinder movements.
            </p>
            <div className="space-y-3">
              {PAIN_AREAS.map((area) => {
                const isActive = painAreas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    onClick={() => togglePainArea(area.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isActive ? 'border-[#f87171] bg-[#7f1d1d]/20' : 'border-[#2a2a2a] bg-[#111]'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isActive ? 'text-[#f87171]' : 'text-white'}`}>{area.label}</p>
                    </div>
                    {isActive && <span className="text-[#f87171] text-lg">✓</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#666] leading-relaxed mt-4">
              This reduces strain on the area you pick — it isn&apos;t medical advice. For a real or persistent injury, please get it looked at by a professional.
            </p>
            <button onClick={() => setShowPainPicker(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-[#2a2a2a] text-white font-semibold text-sm">
              Done
            </button>
          </div>
        </div>
      )}

      {showEquipmentPicker && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
             onClick={() => setShowEquipmentPicker(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-3xl p-6 w-full max-w-lg"
               onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-1">Your Equipment</h2>
            <p className="text-[#888] text-sm mb-5">
              Toggle what you actually own — exercises that need gear you don&apos;t have get swapped for a bodyweight or band alternative automatically. Same number of exercises, just gear you can use. Nothing selected? Everything defaults to bodyweight and Suryanamaskar.
            </p>
            <div className="space-y-3">
              {EQUIPMENT_ITEMS.map((item) => {
                const isActive = ownedEquipment.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleEquipment(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isActive ? 'border-[#7dd3fc] bg-[#1e3a5f]/20' : 'border-[#2a2a2a] bg-[#111]'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isActive ? 'text-[#7dd3fc]' : 'text-white'}`}>{item.label}</p>
                    </div>
                    {isActive && <span className="text-[#7dd3fc] text-lg">✓</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#666] leading-relaxed mt-4">
              Bodyweight exercises (pushups, Suryanamaskar, planks, etc.) are always available regardless of what&apos;s toggled here.
            </p>
            <button onClick={() => setShowEquipmentPicker(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-[#2a2a2a] text-white font-semibold text-sm">
              Done
            </button>
          </div>
        </div>
      )}

      <div className={readOnly ? 'pointer-events-none' : undefined}>
        {screen === 'workout' && (
          <WorkoutScreen
            checked={checked}
            onCheckedChange={handleCheckedChange}
            restMultiplier={cfg.restMultiplier}
            level={level}
            completedSessions={completedSessions}
            onSessionComplete={handleSessionComplete}
            customExercises={customExercises}
            onAddCustomExercise={handleAddCustomExercise}
            onRemoveCustomExercise={handleRemoveCustomExercise}
            streak={streak}
            painAreas={painAreas}
            ownedEquipment={ownedEquipment}
            profileId={profileId}
          />
        )}
        {screen === 'progress' && (
          <ProgressScreen
            completedSessions={completedSessions}
            onReset={handleReset}
            profileId={profileId}
            sessionDates={sessionDates}
          />
        )}
        {screen === 'tips' && <TipsScreen />}
      </div>

      <BottomNav active={screen} onChange={setScreen} />
    </div>
  );
}

function IdentityPicker({ onChoose }: { onChoose: (id: ProfileId) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0f0f0f] px-6 text-center">
      <h1 className="text-white font-bold text-xl mb-2">Who&apos;s tracking?</h1>
      <p className="text-[#888] text-sm mb-8">Pick your profile — your progress stays separate from theirs.</p>
      <div className="w-full max-w-sm space-y-3">
        {PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => onChoose(p.id)}
            className="w-full py-4 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] text-white font-bold text-base active:scale-95 transition-transform"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#0f0f0f]">
      <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [myProfileId, setMyProfileId] = useState<ProfileId | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<ProfileId | null>(null);
  const [identityLoaded, setIdentityLoaded] = useState(false);
  const [syncedProfileId, setSyncedProfileId] = useState<ProfileId | null>(null);

  useEffect(() => {
    try {
      const storedMe = localStorage.getItem(MY_PROFILE_KEY);
      const storedViewing = localStorage.getItem(VIEWING_PROFILE_KEY);
      if (isProfileId(storedMe)) {
        setMyProfileId(storedMe);
        setViewingProfileId(isProfileId(storedViewing) ? storedViewing : storedMe);
      }
    } catch {}
    setIdentityLoaded(true);
  }, []);

  useEffect(() => {
    if (!myProfileId || !viewingProfileId) return;
    let cancelled = false;
    // A slow/stalled connection should never block the app forever — fall through to
    // local data after a few seconds; the sync itself keeps running in the background.
    const sync = syncProfile(viewingProfileId, viewingProfileId === myProfileId);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 6000));
    Promise.race([sync, timeout]).finally(() => {
      if (!cancelled) setSyncedProfileId(viewingProfileId);
    });
    return () => { cancelled = true; };
  }, [myProfileId, viewingProfileId]);

  const cloudReady = syncedProfileId === viewingProfileId;

  const chooseIdentity = (id: ProfileId) => {
    try {
      localStorage.setItem(MY_PROFILE_KEY, id);
      localStorage.setItem(VIEWING_PROFILE_KEY, id);
    } catch {}
    setMyProfileId(id);
    setViewingProfileId(id);
  };

  const switchProfile = (id: ProfileId) => {
    try { localStorage.setItem(VIEWING_PROFILE_KEY, id); } catch {}
    setViewingProfileId(id);
  };

  const resetIdentity = () => {
    try {
      localStorage.removeItem(MY_PROFILE_KEY);
      localStorage.removeItem(VIEWING_PROFILE_KEY);
    } catch {}
    setMyProfileId(null);
    setViewingProfileId(null);
  };

  if (!identityLoaded) return <Spinner />;
  if (!myProfileId || !viewingProfileId) return <IdentityPicker onChoose={chooseIdentity} />;
  if (!cloudReady) return <Spinner />;

  return (
    <WorkoutApp
      key={viewingProfileId}
      profileId={viewingProfileId}
      readOnly={viewingProfileId !== myProfileId}
      viewerLabel={profileLabel(viewingProfileId)}
      onSwitchProfile={switchProfile}
      onResetIdentity={resetIdentity}
    />
  );
}
