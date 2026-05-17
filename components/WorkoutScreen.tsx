'use client';
import { useState } from 'react';
import { PHASES, DAYS, DAY_LABELS, type Day } from '@/data/workoutData';
import ExerciseCard from './ExerciseCard';
import HIITTimer from './HIITTimer';

import type { Level, StreakData } from '@/app/page';

interface Props {
  checked: Record<string, boolean>;
  onCheckedChange: (key: string, value: boolean) => void;
  restMultiplier: number;
  level: Level;
  completedDays: string[];
  onDayComplete: (dayKey: string) => void;
  streak: StreakData;
}

export default function WorkoutScreen({ checked, onCheckedChange, restMultiplier, level, completedDays, onDayComplete, streak }: Props) {
  const todayMap: Record<string, Day> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
  };
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDay = todayMap[todayName] as Day | undefined;

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [day, setDay] = useState<Day>(todayDay && DAYS.includes(todayDay) ? todayDay : 'Mon');

  const phaseData = PHASES[phase];
  const dayData = phaseData[day];

  const phaseColors = {
    1: { active: 'bg-[#14532d] border-[#4ade80] text-[#4ade80]', dot: '#4ade80' },
    2: { active: 'bg-[#713f12] border-[#facc15] text-[#facc15]', dot: '#facc15' },
    3: { active: 'bg-[#7f1d1d] border-[#f87171] text-[#f87171]', dot: '#f87171' },
  };

  return (
    <div>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide sticky top-[60px] z-40 bg-[#0f0f0f]">
        {([1, 2, 3] as const).map((p) => {
          const isActive = phase === p;
          const c = phaseColors[p];
          return (
            <button
              key={p}
              onClick={() => { setPhase(p); setDay('Mon'); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full border-[1.5px] font-semibold text-[13px] transition-all ${
                isActive ? c.active : 'border-[#2a2a2a] text-[#888] bg-transparent'
              }`}
            >
              Phase {p} · {PHASES[p].weeks}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide sticky top-[108px] z-40 bg-[#0f0f0f]">
        {DAYS.map((d) => {
          const isActive = day === d;
          const isToday = d === todayDay;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`flex-shrink-0 px-3 py-2 rounded-2xl border text-[11px] font-semibold transition-all text-center ${
                isActive
                  ? 'bg-[#222] border-[#555] text-white'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#888]'
              }`}
            >
              <span className="block">{d}</span>
              {isToday && <span className="block text-[9px] text-[#4ade80] mt-0.5 font-bold">TODAY</span>}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3">
        {(() => {
          const dayKey = `p${phase}-${day}`;
          const isDayDone = completedDays.includes(dayKey);
          return (
            <div className={`rounded-2xl p-4 mb-4 border ${
              isDayDone ? 'bg-[#14532d]/30 border-[#4ade80]' :
              phase === 1 ? 'bg-[#14532d]/20 border-[#14532d]' :
              phase === 2 ? 'bg-[#713f12]/20 border-[#713f12]' :
              'bg-[#7f1d1d]/20 border-[#7f1d1d]'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">{day} — {DAY_LABELS[day]}</h2>
                  <p className="text-[#888] text-xs mt-0.5">Phase {phase}: {phaseData.label} · {phaseData.weeks}</p>
                  {streak.count > 0 && day === todayDay && (
                    <p className="text-[#facc15] text-xs mt-1 font-semibold">🔥 {streak.count} day streak — keep going!</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {day === todayDay && !isDayDone && (
                    <span className="bg-[#1e3a5f] text-[#60a5fa] text-[11px] font-bold px-3 py-1.5 rounded-lg">Today</span>
                  )}
                  {isDayDone ? (
                    <span className="bg-[#14532d] text-[#4ade80] text-[11px] font-bold px-3 py-1.5 rounded-lg">✓ Done</span>
                  ) : (
                    <button
                      onClick={() => onDayComplete(dayKey)}
                      className="bg-[#4ade80] text-black text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {Array.isArray(dayData) ? (
          <div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 mb-4">
              <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">How to read this</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0f0f0f] rounded-xl p-3">
                  <p className="text-white font-bold text-lg">{dayData.length}</p>
                  <p className="text-[10px] text-[#888] mt-0.5">Exercises</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-xl p-3">
                  <p className="text-white font-bold text-lg">
                    {Math.max(...dayData.map(e => e.sets))}
                  </p>
                  <p className="text-[10px] text-[#888] mt-0.5">Max Sets</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-xl p-3">
                  <p className="text-white font-bold text-lg">
                    ~{Math.round(dayData.reduce((acc, e) => acc + e.sets * (e.restSeconds / 60 + 0.75), 0))}m
                  </p>
                  <p className="text-[10px] text-[#888] mt-0.5">Est. Time</p>
                </div>
              </div>
              <p className="text-[11px] text-[#888] mt-3 leading-relaxed">
                <span className="text-white font-semibold">Sets</span> = how many groups.&nbsp;
                <span className="text-white font-semibold">Reps</span> = how many times per group.&nbsp;
                Tap a set button when done — rest timer starts automatically.
              </p>
            </div>

            <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Exercises</p>
            {dayData.map((ex, i) => (
              <ExerciseCard
                key={i}
                exercise={ex}
                phase={phase}
                dayKey={day}
                exerciseIndex={i}
                checked={checked}
                onCheckedChange={onCheckedChange}
                restMultiplier={restMultiplier}
                level={level}
              />
            ))}
          </div>
        ) : dayData.type === 'hiit' ? (
          <HIITTimer data={dayData} />
        ) : (
          <div className="space-y-3">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
              <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">Cardio Session</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-lg">{dayData.duration}</p>
                  <p className="text-[10px] text-[#888] mt-0.5">Duration</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-base leading-tight">{dayData.pace}</p>
                  <p className="text-[10px] text-[#888] mt-0.5">Pace</p>
                </div>
              </div>
              <div className="space-y-2">
                {dayData.items.map((item, i) => (
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
        )}
      </div>
    </div>
  );
}
