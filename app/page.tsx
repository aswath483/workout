'use client';
import { useState, useEffect } from 'react';
import WorkoutScreen from '@/components/WorkoutScreen';
import ProgressScreen from '@/components/ProgressScreen';
import TipsScreen from '@/components/TipsScreen';
import BottomNav from '@/components/BottomNav';
import type { ExerciseInfo } from '@/data/workoutData';

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

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, [key]);

  const set = (v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('workout');
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [checked, setChecked, checkedLoaded] = useLocalStorage<Record<string, boolean>>('wk_checked', {});
  const [completedSessions, setCompletedSessions, sessionsLoaded] = useLocalStorage<number[]>('wk_sessions_done', []);
  const [customExercises, setCustomExercises, customLoaded] = useLocalStorage<Record<string, ExerciseInfo[]>>('wk_custom', {});
  const [level, setLevel, levelLoaded] = useLocalStorage<Level>('wk_level', 'beginner');
  const [streak, setStreak, streakLoaded] = useLocalStorage<StreakData>('wk_streak', { count: 0, lastDate: '' });

  const handleCheckedChange = (key: string, value: boolean) => {
    setChecked((prev) => ({ ...prev, [key]: value }));
  };

  const handleSessionComplete = (n: number) => {
    if (completedSessions.includes(n)) return;
    setCompletedSessions((prev) => [...prev, n]);
    const today = todayStr();
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
  };

  if (!checkedLoaded || !sessionsLoaded || !customLoaded || !levelLoaded || !streakLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cfg = LEVEL_CONFIG[level];

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-[#f1f1f1] pb-20">
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[17px] tracking-tight">12-Week Transformation</h1>
            <p className="text-[12px] text-[#888] mt-0.5">
              {screen === 'workout' ? 'Fat Loss · Muscle · Toned Look' :
               screen === 'progress' ? 'Track Your Journey' : 'Nutrition & Recovery Guide'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {streak.count > 0 && (
              <div className="flex items-center gap-1 bg-[#713f12]/60 border border-[#facc15]/30 rounded-xl px-2.5 py-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-[#facc15] font-bold text-[13px]">{streak.count}</span>
              </div>
            )}
            <button
              onClick={() => setShowLevelPicker(true)}
              className="flex items-center gap-1.5 bg-[#2a2a2a] rounded-xl px-3 py-2"
            >
              <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
              <svg className="w-3 h-3 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {showLevelPicker && (
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
        />
      )}
      {screen === 'progress' && (
        <ProgressScreen
          completedSessions={completedSessions}
          onReset={handleReset}
        />
      )}
      {screen === 'tips' && <TipsScreen />}

      <BottomNav active={screen} onChange={setScreen} />
    </div>
  );
}
