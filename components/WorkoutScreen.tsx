'use client';
import { useState } from 'react';
import {
  SESSIONS, PHASES, EXERCISE_LIBRARY, PAIN_AREAS,
  EXERCISE_VARIANTS, EXERCISE_STRAIN_AREAS, canDoExercise,
  type ExerciseInfo, type PainArea, type EquipmentItem, type HIITDay,
} from '@/data/workoutData';
import ExerciseCard from './ExerciseCard';
import HIITTimer from './HIITTimer';
import type { Level, Goal, StreakData } from '@/app/page';
import { profileKey, type ProfileId } from '@/lib/profiles';
import { adaptExercisesForPain } from '@/lib/painAdaptation';
import { adaptExercisesForEquipment } from '@/lib/equipmentAdaptation';
import { applyWeeklyVariation, applyDeload, isDeloadWeek } from '@/lib/weeklyVariation';
import { getFinisherExercises, applyNewToTraining } from '@/lib/goalAdaptation';
import { adaptHiitExercises } from '@/lib/hiitAdaptation';

const CARDIO_IMPACT_AREAS: PainArea[] = ['knee', 'lower_back'];
function painAreaLabel(area: PainArea): string {
  return PAIN_AREAS.find((a) => a.id === area)?.label ?? area;
}

interface Props {
  checked: Record<string, boolean>;
  onCheckedChange: (key: string, value: boolean) => void;
  restMultiplier: number;
  level: Level;
  completedSessions: number[];
  onSessionComplete: (n: number) => void;
  customExercises: Record<string, ExerciseInfo[]>;
  onAddCustomExercise: (sessionNum: number, ex: ExerciseInfo) => void;
  onRemoveCustomExercise: (sessionNum: number, exName: string) => void;
  streak: StreakData;
  profileId: ProfileId;
  painAreas: PainArea[];
  ownedEquipment: EquipmentItem[];
  goal: Goal;
  newToTraining: boolean;
}

type MuscleFilter = 'all' | 'push' | 'pull' | 'legs' | 'core' | 'full';

const PHASE_COLORS = {
  1: { bg: 'bg-[#14532d]/20', border: 'border-[#14532d]', text: 'text-[#4ade80]', dot: '#4ade80', badge: 'bg-[#14532d] text-[#4ade80]', label: 'Foundation' },
  2: { bg: 'bg-[#713f12]/20', border: 'border-[#713f12]', text: 'text-[#facc15]', dot: '#facc15', badge: 'bg-[#713f12] text-[#facc15]', label: 'Growth' },
  3: { bg: 'bg-[#7f1d1d]/20', border: 'border-[#7f1d1d]', text: 'text-[#f87171]', dot: '#f87171', badge: 'bg-[#7f1d1d] text-[#f87171]', label: 'Aesthetic' },
};

const TYPE_ICON: Record<string, string> = {
  strength: '💪',
  cardio: '🏃',
  hiit: '⚡',
};

export const MOODS = [
  { emoji: '😴', label: 'Easy',    value: 'easy' },
  { emoji: '😊', label: 'Good',    value: 'good' },
  { emoji: '😤', label: 'Hard',    value: 'hard' },
  { emoji: '💀', label: 'Brutal',  value: 'brutal' },
  { emoji: '🤒', label: 'Off Day', value: 'offday' },
];

const WARMUP_ITEMS = [
  '5 min light cardio (jog, jump rope, or brisk walk) — get your heart rate up',
  'Arm circles — 10 each direction, both arms',
  'Hip circles — 10 each direction',
  'Bodyweight squats — 10 slow reps',
  'Walking lunges — 5 steps each leg',
];

export interface SessionNote {
  mood: string;
  note: string;
  date: string;
}

function readNotes(profileId: ProfileId): Record<number, SessionNote> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(profileKey(profileId, 'session_notes')) || '{}'); } catch { return {}; }
}

function saveNote(profileId: ProfileId, sessionNum: number, entry: SessionNote) {
  const all = readNotes(profileId);
  all[sessionNum] = entry;
  try { localStorage.setItem(profileKey(profileId, 'session_notes'), JSON.stringify(all)); } catch {}
}

const EXERCISE_BY_NAME: Record<string, ExerciseInfo> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.name, e])
);

interface CombinedAdapted {
  exercise: ExerciseInfo;
  swappedFor?: PainArea;
  originalName?: string;
  caution?: PainArea;
  equipmentSwap?: boolean;
  equipmentCaution?: boolean;
  manualSwap?: boolean;
}

// Same-muscle, comparable-intensity alternatives for a given (already equipment/pain
// adapted) exercise name — reuses the curated weekly-variation pool so a personal "I'm
// bored of this" swap can never be less effective or reintroduce gear/pain conflicts.
function getSwapOptions(name: string, ownedEquipment: EquipmentItem[], activePainAreas: PainArea[]): string[] {
  const variants = EXERCISE_VARIANTS[name] ?? [];
  return variants.filter((v) => {
    if (!canDoExercise(v, ownedEquipment)) return false;
    const strains = EXERCISE_STRAIN_AREAS[v];
    if (strains?.some((a) => activePainAreas.includes(a))) return false;
    return true;
  });
}

// Applies the user's on-demand, view-only picks from getSwapOptions — never persisted,
// resets whenever the session screen is left, purely a "give me something different
// today" escape hatch on top of the automatic pain/equipment/variation layers.
function applyManualSwaps(
  items: CombinedAdapted[],
  overrides: Record<number, string>,
  ownedEquipment: EquipmentItem[],
  activePainAreas: PainArea[]
): CombinedAdapted[] {
  return items.map((item, i) => {
    const chosen = overrides[i];
    if (!chosen) return item;
    const options = getSwapOptions(item.exercise.name, ownedEquipment, activePainAreas);
    if (!options.includes(chosen)) return item;
    const alt = EXERCISE_BY_NAME[chosen];
    if (!alt) return item;
    return { exercise: alt, originalName: item.exercise.name, manualSwap: true };
  });
}

// Runs equipment adaptation first (swap for gear the profile actually owns), then pain
// adaptation on the result (swap further if that gear-appropriate pick still strains an
// active pain area), and merges both swap trails into one badge-ready object per slot.
function combineAdaptations(exercises: ExerciseInfo[], ownedEquipment: EquipmentItem[], activePainAreas: PainArea[]): CombinedAdapted[] {
  const eqAdapted = adaptExercisesForEquipment(exercises, ownedEquipment);
  const painAdapted = adaptExercisesForPain(eqAdapted.map((e) => e.exercise), activePainAreas);
  return exercises.map((raw, i) => {
    const eq = eqAdapted[i];
    const pain = painAdapted[i];
    const anySwap = eq.swapped || !!pain.swappedFor;
    return {
      exercise: pain.exercise,
      swappedFor: pain.swappedFor,
      caution: pain.caution,
      equipmentSwap: eq.swapped,
      equipmentCaution: eq.caution,
      originalName: anySwap ? raw.name : undefined,
    };
  });
}

export default function WorkoutScreen({
  checked, onCheckedChange, restMultiplier, level,
  completedSessions, onSessionComplete,
  customExercises, onAddCustomExercise, onRemoveCustomExercise,
  streak, profileId, painAreas, ownedEquipment, goal, newToTraining,
}: Props) {
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<MuscleFilter>('all');

  const nextSession = SESSIONS.find(s => !completedSessions.includes(s.sessionNum)) ?? SESSIONS[SESSIONS.length - 1];

  if (activeSession !== null) {
    return (
      <SessionDetail
        sessionNum={activeSession}
        checked={checked}
        onCheckedChange={onCheckedChange}
        restMultiplier={restMultiplier}
        level={level}
        completedSessions={completedSessions}
        onSessionComplete={onSessionComplete}
        customExercises={customExercises}
        onAddCustomExercise={onAddCustomExercise}
        onRemoveCustomExercise={onRemoveCustomExercise}
        painAreas={painAreas}
        ownedEquipment={ownedEquipment}
        goal={goal}
        newToTraining={newToTraining}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        libraryFilter={libraryFilter}
        setLibraryFilter={setLibraryFilter}
        streak={streak}
        profileId={profileId}
        onBack={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Next Session Hero */}
      <div className={`rounded-2xl border p-5 ${PHASE_COLORS[nextSession.phase].bg} ${PHASE_COLORS[nextSession.phase].border}`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${PHASE_COLORS[nextSession.phase].text}`}>
          {completedSessions.length === 72 ? 'All Done!' : 'Up Next'}
        </p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-white font-bold text-xl leading-tight">
              Session {nextSession.sessionNum} <span className="text-[#888] font-normal text-sm">of 72</span>
            </h2>
            <p className={`text-sm font-semibold mt-0.5 ${PHASE_COLORS[nextSession.phase].text}`}>
              Phase {nextSession.phase} · {PHASE_COLORS[nextSession.phase].label}
            </p>
            <p className="text-[#ccc] text-sm mt-1">
              {TYPE_ICON[nextSession.type]} {nextSession.label}
            </p>
            {streak.count > 0 && (
              <p className="text-[#facc15] text-xs mt-2 font-semibold">🔥 {streak.count} day streak — keep it going!</p>
            )}
          </div>
          <button
            onClick={() => setActiveSession(nextSession.sessionNum)}
            className="flex-shrink-0 bg-white text-black font-bold text-sm px-5 py-3 rounded-xl active:scale-95 transition-transform"
          >
            Start →
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-[#888] mb-1.5">
            <span>{completedSessions.length} / 72 sessions done</span>
            <span>{Math.round((completedSessions.length / 72) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedSessions.length / 72) * 100}%`, background: PHASE_COLORS[nextSession.phase].dot }}
            />
          </div>
        </div>
      </div>

      {/* Phase → Week groups */}
      {([1, 2, 3] as const).map(ph => {
        const c = PHASE_COLORS[ph];
        const phaseSessions = SESSIONS.filter(s => s.phase === ph);
        const donePh = phaseSessions.filter(s => completedSessions.includes(s.sessionNum)).length;
        const notes = readNotes(profileId);
        return (
          <div key={ph} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            {/* Phase header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                <span className="text-white font-bold text-sm">Phase {ph} · {c.label}</span>
                <span className="text-[#666] text-xs">
                  Weeks {(ph-1)*4+1}–{ph*4}
                </span>
              </div>
              <span className="text-[#888] text-xs">{donePh}/24 done</span>
            </div>

            {/* Week sub-groups */}
            {[1, 2, 3, 4].map(wip => {
              const weekSessions = SESSIONS.filter(s => s.phase === ph && s.weekInPhase === wip);
              const programWeek = (ph - 1) * 4 + wip;
              const doneWk = weekSessions.filter(s => completedSessions.includes(s.sessionNum)).length;
              return (
                <div key={wip} className="border-b border-[#1a1a1a] last:border-0">
                  {/* Week header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#141414]">
                    <span className={`text-xs font-semibold ${c.text}`}>Week {programWeek}</span>
                    <span className="text-[#555] text-xs">{doneWk}/6</span>
                  </div>
                  {/* Sessions in this week */}
                  {weekSessions.map(s => {
                    const isDone = completedSessions.includes(s.sessionNum);
                    const isNext = s.sessionNum === nextSession.sessionNum;
                    const note = notes[s.sessionNum];
                    const moodEmoji = note ? MOODS.find(m => m.value === note.mood)?.emoji : null;
                    return (
                      <button
                        key={s.sessionNum}
                        onClick={() => setActiveSession(s.sessionNum)}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a] last:border-0 text-left transition-colors active:bg-[#222] ${
                          isNext ? 'bg-[#1e1e1e]' : ''
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                          isDone ? 'bg-[#14532d] text-[#4ade80]' :
                          isNext ? c.badge :
                          'bg-[#222] text-[#555]'
                        }`}>
                          {isDone ? '✓' : s.sessionNum}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isDone ? 'text-[#555]' : isNext ? 'text-white font-semibold' : 'text-[#aaa]'}`}>
                            {TYPE_ICON[s.type]} {s.label}
                          </p>
                          {note?.note && (
                            <p className="text-[10px] text-[#555] mt-0.5 truncate">{note.note}</p>
                          )}
                        </div>
                        {moodEmoji && <span className="text-base flex-shrink-0">{moodEmoji}</span>}
                        {isNext && !moodEmoji && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${c.badge}`}>Next</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── SESSION DETAIL ───────────────────────────────────────────────────────────

interface DetailProps extends Omit<Props, 'completedSessions' | 'onSessionComplete'> {
  sessionNum: number;
  completedSessions: number[];
  onSessionComplete: (n: number) => void;
  showLibrary: boolean;
  setShowLibrary: (v: boolean) => void;
  libraryFilter: MuscleFilter;
  setLibraryFilter: (v: MuscleFilter) => void;
  onBack: () => void;
}

function SessionDetail({
  sessionNum, checked, onCheckedChange, restMultiplier, level,
  completedSessions, onSessionComplete,
  customExercises, onAddCustomExercise, onRemoveCustomExercise,
  showLibrary, setShowLibrary, libraryFilter, setLibraryFilter,
  streak, onBack, profileId, painAreas, ownedEquipment, goal, newToTraining,
}: DetailProps) {
  const session = SESSIONS.find(s => s.sessionNum === sessionNum)!;
  const phaseData = PHASES[session.phase];
  const dayData = phaseData[session.day];
  const c = PHASE_COLORS[session.phase];
  const isDone = completedSessions.includes(sessionNum);
  const sessionKey = `s${sessionNum}`;
  const customs = customExercises[sessionKey] ?? [];
  const rawBaseExercises = Array.isArray(dayData) ? dayData : [];
  const variedBaseExercises = applyWeeklyVariation(rawBaseExercises, session.weekInPhase);

  // "Feeling off today?" — a same-visit-only pain flag on top of the persistent
  // settings toggle, for a one-off ache that doesn't warrant a standing setting.
  const [todayPainAreas, setTodayPainAreas] = useState<PainArea[]>([]);
  const toggleTodayPain = (id: PainArea) => {
    setTodayPainAreas((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };
  const effectivePainAreas = Array.from(new Set([...painAreas, ...todayPainAreas]));

  // "Bored of this exercise?" — a same-visit-only manual swap, cycling through the
  // curated weekly-variation pool (never persisted, resets when you leave the session).
  const [manualSwaps, setManualSwaps] = useState<Record<number, string>>({});
  const cycleSwap = (i: number, options: string[]) => {
    if (options.length === 0) return;
    setManualSwaps((prev) => {
      const current = prev[i];
      const idx = current ? options.indexOf(current) : -1;
      if (idx === -1) return { ...prev, [i]: options[0] };
      if (idx === options.length - 1) {
        const next = { ...prev };
        delete next[i];
        return next;
      }
      return { ...prev, [i]: options[idx + 1] };
    });
  };

  const equipmentPainAdapted = combineAdaptations(variedBaseExercises, ownedEquipment, effectivePainAreas);
  const baseSwapOptions = equipmentPainAdapted.map((item) => getSwapOptions(item.exercise.name, ownedEquipment, effectivePainAreas));
  const manualSwapped = applyManualSwaps(equipmentPainAdapted, manualSwaps, ownedEquipment, effectivePainAreas);

  const baseExercises = applyDeload(
    applyNewToTraining(manualSwapped, session.phase, session.weekInPhase, newToTraining),
    session.weekInPhase
  );
  const adaptedCustoms = applyDeload(
    applyNewToTraining(combineAdaptations(customs, ownedEquipment, effectivePainAreas), session.phase, session.weekInPhase, newToTraining),
    session.weekInPhase
  );
  const finisherExercises: CombinedAdapted[] = session.type === 'strength'
    ? getFinisherExercises(goal).map((exercise) => ({ exercise }))
    : [];
  const allSessionExercises = [...baseExercises, ...adaptedCustoms, ...finisherExercises];

  const [warmupDone, setWarmupDone] = useState<boolean[]>(() => Array(WARMUP_ITEMS.length).fill(false));
  const [warmupExpanded, setWarmupExpanded] = useState(true);

  // Note / mood state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savedNote, setSavedNote] = useState<SessionNote | null>(() => readNotes(profileId)[sessionNum] ?? null);

  const handleSaveNote = () => {
    const entry: SessionNote = { mood: selectedMood, note: noteText.trim(), date: new Date().toISOString() };
    saveNote(profileId, sessionNum, entry);
    setSavedNote(entry);
    setShowNoteModal(false);
    onSessionComplete(sessionNum);
  };

  // Library: filter out exercises already in this session
  const sessionExNames = new Set(
    baseExercises.map(e => e.exercise.name)
      .concat(customs.map(e => e.name))
      .concat(finisherExercises.map(e => e.exercise.name))
  );
  const libraryFiltered = EXERCISE_LIBRARY.filter(e =>
    (libraryFilter === 'all' || e.muscleGroup === libraryFilter) && !sessionExNames.has(e.name)
  );

  return (
    <>
      {/* Note / mood modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border-t border-[#2a2a2a] rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-xl">Session {sessionNum} Done! 🎉</h3>
                <p className="text-[#888] text-sm mt-0.5">How did it feel today?</p>
              </div>
              <button
                onClick={() => { setShowNoteModal(false); onSessionComplete(sessionNum); }}
                className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#888] flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Mood picker */}
            <div className="flex gap-2 mb-5">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    selectedMood === m.value
                      ? 'border-white bg-white/10'
                      : 'border-[#2a2a2a] bg-[#111]'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[9px] text-[#888] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Note input */}
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Any notes for next time? (optional) — e.g. felt weak on squats, need more sleep"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-white text-sm placeholder-[#444] resize-none focus:outline-none focus:border-[#444] mb-4"
              rows={3}
            />

            <button
              onClick={handleSaveNote}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                selectedMood
                  ? 'bg-white text-black'
                  : 'bg-[#2a2a2a] text-[#555]'
              }`}
            >
              {selectedMood ? 'Save & Complete Session' : 'Select a mood above'}
            </button>
          </div>
        </div>
      )}

      {/* Library overlay */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
             onClick={() => setShowLibrary(false)}>
          <div className="bg-[#1a1a1a] border-t border-[#2a2a2a] rounded-t-3xl max-h-[80vh] flex flex-col"
               onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Exercise Library</h3>
                <p className="text-[#888] text-xs mt-0.5">Tap to add to Session {sessionNum}</p>
              </div>
              <button onClick={() => setShowLibrary(false)}
                className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#888]">
                ✕
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
              {(['all', 'push', 'pull', 'legs', 'core', 'full'] as MuscleFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setLibraryFilter(f)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    libraryFilter === f
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-[#888] border-[#2a2a2a]'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="overflow-y-auto px-4 pb-6 space-y-2">
              {libraryFiltered.length === 0 ? (
                <p className="text-[#888] text-sm text-center py-8">All {libraryFilter} exercises already in this session.</p>
              ) : (
                libraryFiltered.map(ex => (
                  <div key={ex.name}
                    className="flex items-center gap-3 bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{ex.name}</p>
                      <p className="text-[#888] text-xs mt-0.5">{ex.muscles.join(' · ')} · {ex.sets}×{ex.reps}</p>
                    </div>
                    <button
                      onClick={() => { onAddCustomExercise(sessionNum, ex); setShowLibrary(false); }}
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${c.badge}`}
                    >
                      +
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Back header */}
        <div className="flex items-center gap-3 px-4 py-3 sticky top-[60px] z-40 bg-[#0f0f0f] border-b border-[#1a1a1a]">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[#888] text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Sessions
          </button>
          <span className="text-[#444]">/</span>
          <span className="text-white text-sm font-semibold">Session {sessionNum} of 72</span>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Session banner */}
          <div className={`rounded-2xl border p-4 ${c.bg} ${c.border}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${c.text}`}>
                  Phase {session.phase} · {c.label}
                </p>
                <h2 className="text-white font-bold text-lg mt-1">
                  {TYPE_ICON[session.type]} {session.label}
                </h2>
                {streak.count > 0 && (
                  <p className="text-[#facc15] text-xs mt-1.5 font-semibold">🔥 {streak.count} day streak!</p>
                )}
              </div>
              {isDone ? (
                <span className="flex-shrink-0 bg-[#14532d] text-[#4ade80] text-[11px] font-bold px-3 py-1.5 rounded-lg">
                  ✓ Done
                </span>
              ) : (
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="flex-shrink-0 bg-white text-black text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Feeling off today? — one-off pain flag, doesn't touch the persistent setting */}
          {!isDone && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-3">
              <p className="text-[11px] text-[#888] mb-2">Feeling off today? Flag it just for this session:</p>
              <div className="flex gap-1.5 flex-wrap">
                {PAIN_AREAS.map((area) => {
                  const active = todayPainAreas.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleTodayPain(area.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                        active ? 'bg-[#7f1d1d]/30 border-[#f87171] text-[#f87171]' : 'bg-[#111] border-[#2a2a2a] text-[#888]'
                      }`}
                    >
                      {area.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved note for completed session */}
          {isDone && savedNote && (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{MOODS.find(m => m.value === savedNote.mood)?.emoji ?? '✓'}</span>
                <span className="text-white text-sm font-semibold">
                  {MOODS.find(m => m.value === savedNote.mood)?.label}
                </span>
                <span className="text-[#555] text-xs ml-auto">
                  {new Date(savedNote.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {savedNote.note && (
                <p className="text-[#aaa] text-sm leading-relaxed">{savedNote.note}</p>
              )}
            </div>
          )}

          {/* Strength session */}
          {session.type === 'strength' && (
            <div>
              {!isDone && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-4">
                  <button
                    onClick={() => setWarmupExpanded(!warmupExpanded)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <span className="text-sm font-bold text-white">
                      🔥 Warm-up {warmupDone.every(Boolean) ? '· Done' : `· ${warmupDone.filter(Boolean).length}/${WARMUP_ITEMS.length}`}
                    </span>
                    <span className={`text-[#888] text-xs transition-transform ${warmupExpanded ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {warmupExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-[11px] text-[#888] mb-1">Do this before your working sets — especially on a heavy day.</p>
                      {WARMUP_ITEMS.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => setWarmupDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                          className="w-full flex items-center gap-3 text-left"
                        >
                          <span className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center text-[11px] ${
                            warmupDone[i] ? 'bg-[#4ade80] border-[#4ade80] text-black' : 'border-[#2a2a2a] text-transparent'
                          }`}>✓</span>
                          <span className={`text-[13px] leading-snug ${warmupDone[i] ? 'text-[#666] line-through' : 'text-[#ccc]'}`}>{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {isDeloadWeek(session.weekInPhase) && (
                <div className="bg-[#1e3a5f]/30 border border-[#1e3a5f] rounded-2xl p-3 mb-4">
                  <p className="text-[12px] text-[#60a5fa] leading-relaxed">
                    🪶 <span className="font-semibold">Deload week</span> — one fewer set per exercise to help you recover before the next phase. Same weight, same exercises, just lighter volume.
                  </p>
                </div>
              )}
              {/* Quick stats */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#0f0f0f] rounded-xl p-3">
                    <p className="text-white font-bold text-lg">{allSessionExercises.length}</p>
                    <p className="text-[10px] text-[#888] mt-0.5">Exercises</p>
                  </div>
                  <div className="bg-[#0f0f0f] rounded-xl p-3">
                    <p className="text-white font-bold text-lg">
                      {allSessionExercises.length > 0 ? Math.max(...allSessionExercises.map(e => e.exercise.sets)) : '—'}
                    </p>
                    <p className="text-[10px] text-[#888] mt-0.5">Max Sets</p>
                  </div>
                  <div className="bg-[#0f0f0f] rounded-xl p-3">
                    <p className="text-white font-bold text-lg">
                      ~{Math.round(allSessionExercises.reduce((acc, e) => acc + e.exercise.sets * (e.exercise.restSeconds / 60 + 0.75), 0))}m
                    </p>
                    <p className="text-[10px] text-[#888] mt-0.5">Est. Time</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#888] mt-3 leading-relaxed">
                  <span className="text-white font-semibold">Sets</span> = how many groups.{' '}
                  <span className="text-white font-semibold">Reps</span> = how many times per group.{' '}
                  Tap a set button when done — rest timer starts automatically.
                </p>
              </div>

              <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Exercises</p>

              {baseExercises.map((adapted, i) => (
                <ExerciseCard
                  key={`${i}-${adapted.exercise.name}`}
                  exercise={adapted.exercise}
                  swappedFor={adapted.swappedFor}
                  originalName={adapted.originalName}
                  caution={adapted.caution}
                  equipmentSwap={adapted.equipmentSwap}
                  equipmentCaution={adapted.equipmentCaution}
                  manualSwap={adapted.manualSwap}
                  swapAvailable={baseSwapOptions[i].length > 0}
                  onSwap={() => cycleSwap(i, baseSwapOptions[i])}
                  phase={session.phase}
                  sessionKey={sessionKey}
                  exerciseIndex={i}
                  checked={checked}
                  onCheckedChange={onCheckedChange}
                  restMultiplier={restMultiplier}
                  level={level}
                  profileId={profileId}
                  defaultExpanded={newToTraining}
                />
              ))}

              {adaptedCustoms.length > 0 && (
                <>
                  <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3 mt-2">Added by You</p>
                  {adaptedCustoms.map((adapted, i) => (
                    <ExerciseCard
                      key={`custom-${i}-${adapted.exercise.name}`}
                      exercise={adapted.exercise}
                      swappedFor={adapted.swappedFor}
                      originalName={adapted.originalName}
                      caution={adapted.caution}
                      equipmentSwap={adapted.equipmentSwap}
                      equipmentCaution={adapted.equipmentCaution}
                      phase={session.phase}
                      sessionKey={`${sessionKey}-custom`}
                      exerciseIndex={i}
                      checked={checked}
                      onCheckedChange={onCheckedChange}
                      restMultiplier={restMultiplier}
                      level={level}
                      profileId={profileId}
                      defaultExpanded={newToTraining}
                      onRemove={() => onRemoveCustomExercise(sessionNum, adapted.originalName ?? adapted.exercise.name)}
                    />
                  ))}
                </>
              )}

              {finisherExercises.length > 0 && (
                <>
                  <p className="text-xs font-bold text-[#c084fc] uppercase tracking-widest mb-3 mt-2">🔥 Fat-Loss Finisher</p>
                  {finisherExercises.map((adapted, i) => (
                    <ExerciseCard
                      key={`finisher-${i}-${adapted.exercise.name}`}
                      exercise={adapted.exercise}
                      phase={session.phase}
                      sessionKey={`${sessionKey}-finisher`}
                      exerciseIndex={i}
                      checked={checked}
                      onCheckedChange={onCheckedChange}
                      restMultiplier={restMultiplier}
                      level={level}
                      profileId={profileId}
                      defaultExpanded={newToTraining}
                    />
                  ))}
                </>
              )}

              {/* Add exercise button */}
              <button
                onClick={() => setShowLibrary(true)}
                className="w-full mt-2 py-4 rounded-2xl border border-dashed border-[#2a2a2a] text-[#888] font-semibold text-sm flex items-center justify-center gap-2 active:bg-[#1a1a1a] transition-colors"
              >
                <span className="text-xl leading-none">+</span>
                Add an Exercise
              </button>
            </div>
          )}

          {/* HIIT session */}
          {session.type === 'hiit' && Array.isArray(dayData) === false && !Array.isArray(dayData) && (dayData as { type: string }).type === 'hiit' && (() => {
            const hiitData = dayData as HIITDay;
            const adaptedMoves = adaptHiitExercises(hiitData.exercises, effectivePainAreas);
            const swappedMoves = adaptedMoves.filter((m) => m.swappedFor);
            return (
              <>
                {swappedMoves.length > 0 && (
                  <div className="bg-[#7f1d1d]/20 border border-[#f87171]/40 rounded-2xl p-3 mb-4">
                    <p className="text-[12px] text-[#f87171] leading-relaxed">
                      🩹 <span className="font-semibold">Adjusted for {painAreaLabel(swappedMoves[0].swappedFor!)} pain:</span>{' '}
                      {swappedMoves.map((m) => `${m.original} → ${m.name}`).join(', ')}. Same work/rest timing.
                    </p>
                  </div>
                )}
                <HIITTimer data={{ ...hiitData, exercises: adaptedMoves.map((m) => m.name) }} />
              </>
            );
          })()}

          {/* Cardio session */}
          {session.type === 'cardio' && !Array.isArray(dayData) && (dayData as { type: string }).type === 'cardio' && (() => {
            const cd = dayData as { type: 'cardio'; duration: string; pace: string; items: string[] };
            const flaggedCardioArea = CARDIO_IMPACT_AREAS.find((a) => effectivePainAreas.includes(a));
            return (
              <div className="space-y-3">
                {flaggedCardioArea && (
                  <div className="bg-[#7f1d1d]/20 border border-[#f87171]/40 rounded-2xl p-3">
                    <p className="text-[12px] text-[#f87171] leading-relaxed">
                      🩹 <span className="font-semibold">{painAreaLabel(flaggedCardioArea)} bothering you?</span>{' '}
                      Swap the jog for cycling, swimming, or a brisk incline walk — same duration, same effort level, much less impact.
                    </p>
                  </div>
                )}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
                  <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">Cardio Session</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                      <p className="text-white font-bold text-lg">{cd.duration}</p>
                      <p className="text-[10px] text-[#888] mt-0.5">Duration</p>
                    </div>
                    <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                      <p className="text-white font-bold text-sm leading-tight">{cd.pace}</p>
                      <p className="text-[10px] text-[#888] mt-0.5">Pace</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cd.items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#14532d] text-[#4ade80] text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-[#ccc] text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
                  <p className="text-xs text-[#888] text-center">No sets or reps today — just time and pace. Enjoy it.</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
