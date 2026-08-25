'use client';
import { useState } from 'react';
import type { ExerciseInfo, PainArea } from '@/data/workoutData';
import { EQUIPMENT_BY_EXERCISE, EZ_BAR_ALTERNATIVE, PAIN_AREAS } from '@/data/workoutData';
import type { Level } from '@/app/page';
import RestTimer from './RestTimer';
import ExerciseAnimation, { EXERCISE_ANIMATION } from './ExerciseAnimation';
import WeightLogger from './WeightLogger';
import type { ProfileId } from '@/lib/profiles';

interface Props {
  exercise: ExerciseInfo;
  phase: 1 | 2 | 3;
  sessionKey: string;
  exerciseIndex: number;
  checked: Record<string, boolean>;
  onCheckedChange: (key: string, value: boolean) => void;
  restMultiplier: number;
  level: Level;
  profileId: ProfileId;
  onRemove?: () => void;
  swappedFor?: PainArea;
  originalName?: string;
  caution?: PainArea;
  equipmentSwap?: boolean;
  equipmentCaution?: boolean;
}

const MUSCLE_COLORS: Record<string, string> = {
  push: 'bg-[#1e3a5f] text-[#60a5fa]',
  pull: 'bg-[#14532d] text-[#4ade80]',
  legs: 'bg-[#713f12] text-[#facc15]',
  core: 'bg-[#581c87] text-[#c084fc]',
  full: 'bg-[#7f1d1d] text-[#f87171]',
};

const PHASE_COLORS = {
  1: { badge: 'bg-[#14532d] text-[#4ade80]', ring: '#4ade80', label: 'P1' },
  2: { badge: 'bg-[#713f12] text-[#facc15]', ring: '#facc15', label: 'P2' },
  3: { badge: 'bg-[#7f1d1d] text-[#f87171]', ring: '#f87171', label: 'P3' },
};

function painAreaLabel(area: PainArea): string {
  return PAIN_AREAS.find((a) => a.id === area)?.label ?? area;
}

export default function ExerciseCard({ exercise, phase, sessionKey, exerciseIndex, checked, onCheckedChange, restMultiplier, level, profileId, onRemove, swappedFor, originalName, caution, equipmentSwap, equipmentCaution }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [setsDone, setSetsDone] = useState<boolean[]>(() => Array(exercise.sets).fill(false));
  const [showTimer, setShowTimer] = useState(false);

  const phaseColor = PHASE_COLORS[phase];
  const muscleColor = MUSCLE_COLORS[exercise.muscleGroup];
  const allSetsKey = `${sessionKey}-${exerciseIndex}`;
  const allDone = setsDone.every(Boolean);
  const effectiveRest = Math.round(exercise.restSeconds * restMultiplier);

  const levelLabels: Record<Level, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const handleSetTap = (i: number) => {
    const updated = [...setsDone];
    updated[i] = !updated[i];
    setSetsDone(updated);

    if (updated[i]) {
      const isLast = i === exercise.sets - 1;
      const allNowDone = updated.every(Boolean);
      if (allNowDone) {
        onCheckedChange(allSetsKey, true);
      }
      if (!isLast) {
        setShowTimer(true);
      }
    } else {
      onCheckedChange(allSetsKey, false);
    }
  };

  const handleTimerDone = () => setShowTimer(false);
  const handleTimerSkip = () => setShowTimer(false);

  const mins = Math.floor(effectiveRest / 60);
  const secs = effectiveRest % 60;
  const restDisplay = mins > 0 ? `${mins}m ${secs > 0 ? secs + 's' : ''}`.trim() : `${secs}s`;

  return (
    <>
      {showTimer && (
        <RestTimer
          seconds={effectiveRest}
          onDone={handleTimerDone}
          onSkip={handleTimerSkip}
        />
      )}

      <div className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-all duration-200 mb-3 ${
        allDone ? 'border-[#2a2a2a] opacity-50' : 'border-[#2a2a2a]'
      }`}>
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start gap-3">
            <div className="text-[#888] text-xs font-bold mt-0.5 min-w-[20px] text-center">
              {exerciseIndex + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-base">{exercise.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${phaseColor.badge}`}>
                  {phaseColor.label}
                </span>
                {swappedFor && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#7f1d1d]/40 text-[#f87171]" title={originalName ? `Swapped from ${originalName}` : undefined}>
                    🩹 Swapped · {painAreaLabel(swappedFor)}
                  </span>
                )}
                {caution && !swappedFor && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#713f12]/40 text-[#facc15]" title="No safe swap known yet for this combination — go easy or skip it.">
                    ⚠️ Caution · {painAreaLabel(caution)}
                  </span>
                )}
                {equipmentSwap && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1e3a5f]/40 text-[#7dd3fc]" title={originalName ? `Swapped from ${originalName} — no gear needed` : 'No gear needed'}>
                    🎒 Swapped · No equipment
                  </span>
                )}
                {equipmentCaution && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#713f12]/40 text-[#facc15]" title="No gear-free swap known yet — skip it or improvise.">
                    ⚠️ Caution · Needs gear
                  </span>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-auto text-[#666] hover:text-[#f87171] text-xs px-2 py-0.5 rounded-lg border border-[#2a2a2a] transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#888] uppercase tracking-wide">Sets</span>
                  <span className="text-white font-bold text-sm">{exercise.sets}</span>
                </div>
                <span className="text-[#444]">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#888] uppercase tracking-wide">Reps</span>
                  <span className="text-white font-bold text-sm">{exercise.reps}</span>
                </div>
                <span className="text-[#444]">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#888] uppercase tracking-wide">Weight</span>
                  <span className="text-white font-bold text-sm">{exercise.weight}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-[#2a2a2a] px-2.5 py-1 rounded-lg">
                  <svg className="w-3 h-3 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[11px] text-[#888]">Rest between sets:</span>
                  <span className="text-[11px] text-white font-bold">{restDisplay}</span>
                  <span className="text-[10px] text-[#888]">({levelLabels[level]})</span>
                </div>
              </div>

              <div className="flex gap-1.5 mt-2 flex-wrap">
                {exercise.muscles.map((m) => (
                  <span key={m} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${muscleColor}`}>
                    {m}
                  </span>
                ))}
              </div>

              {EQUIPMENT_BY_EXERCISE[exercise.name] && (
                <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                  <span className="text-[10px] text-[#555] uppercase tracking-wide">Kit:</span>
                  {EQUIPMENT_BY_EXERCISE[exercise.name].map((item) => (
                    <span key={item} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1e1e1e] text-[#777] border border-[#2e2e2e]">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className={`text-xs ${expanded ? 'text-[#f1f1f1]' : 'text-[#888]'} transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                ▾
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {setsDone.map((done, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleSetTap(i); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
                  done
                    ? `border-[${phaseColor.ring}] bg-opacity-20 text-[${phaseColor.ring}]`
                    : 'border-[#2a2a2a] bg-[#222] text-[#888]'
                } active:scale-95`}
                style={done ? { borderColor: phaseColor.ring, color: phaseColor.ring, backgroundColor: phaseColor.ring + '22' } : {}}
              >
                {done ? '✓' : `S${i + 1}`}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#888] mt-2 text-center">
            Tap a set when done → rest timer starts automatically
          </p>
        </div>

        {expanded && (
          <div className="border-t border-[#2a2a2a] p-4 space-y-4">
            {EXERCISE_ANIMATION[exercise.name] && (
              <div className="flex gap-3 items-start">
                <div className="w-32 flex-shrink-0">
                  <ExerciseAnimation
                    type={EXERCISE_ANIMATION[exercise.name]}
                    accentColor={phase === 1 ? '#4ade80' : phase === 2 ? '#facc15' : '#f87171'}
                  />
                  <p className="text-[10px] text-[#888] text-center mt-1.5">Animation loops · shows movement</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-2">Muscles Targeted</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {exercise.muscles.map((m) => (
                      <span key={m} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${MUSCLE_COLORS[exercise.muscleGroup]}`}>{m}</span>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-1">Sets · Reps · Rest</p>
                  <p className="text-[13px] text-white font-semibold">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                  <p className="text-[12px] text-[#888] mt-0.5">
                    Rest <span className="text-white font-bold">{restDisplay}</span> between each set
                  </p>
                </div>
              </div>
            )}

            {EQUIPMENT_BY_EXERCISE[exercise.name] && (
              <div>
                <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-2">Equipment from your kit</p>
                <div className="flex gap-2 flex-wrap">
                  {EQUIPMENT_BY_EXERCISE[exercise.name].map((item) => (
                    <span key={item} className="text-[12px] font-semibold px-3 py-1 rounded-lg bg-[#1e2a1e] text-[#6ee7b7] border border-[#2a3d2a]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">How to do it</p>
              <ol className="space-y-2">
                {exercise.howTo.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2a2a2a] text-[#888] text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-[#ccc] leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {exercise.tip && (
              <div className="bg-[#713f12]/30 border border-[#713f12] rounded-xl p-3">
                <p className="text-[11px] text-[#facc15] font-bold uppercase tracking-widest mb-1">Tip</p>
                <p className="text-[13px] text-[#fcd34d] leading-relaxed">{exercise.tip}</p>
              </div>
            )}

            {EZ_BAR_ALTERNATIVE[exercise.name] && (
              <div className="bg-[#0c2233]/60 border border-[#164e63] rounded-xl p-3">
                <p className="text-[11px] text-[#38bdf8] font-bold uppercase tracking-widest mb-1">EZ/Curl Bar Option</p>
                <p className="text-[13px] text-[#7dd3fc] leading-relaxed">{EZ_BAR_ALTERNATIVE[exercise.name]}</p>
              </div>
            )}

            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#ff0000]/10 border border-[#ff0000]/30 rounded-xl p-3 hover:bg-[#ff0000]/20 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-6 h-6 bg-[#ff0000] rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] text-white font-semibold">Watch Tutorial on YouTube</p>
                <p className="text-[10px] text-[#888]">See exactly how to do this exercise</p>
              </div>
              <svg className="w-4 h-4 text-[#888] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <WeightLogger
              exerciseKey={exercise.name}
              exerciseName={exercise.name}
              suggestedWeight={exercise.weight}
              profileId={profileId}
            />
          </div>
        )}
      </div>
    </>
  );
}
