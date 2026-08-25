'use client';
import { useState } from 'react';
import { SESSIONS } from '@/data/workoutData';

interface Props {
  sessionDates: Record<number, string>; // sessionNum -> 'YYYY-MM-DD'
}

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function TrainingCalendar({ sessionDates }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const byDate = new Map<string, number[]>();
  for (const [numStr, date] of Object.entries(sessionDates)) {
    const num = Number(numStr);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(num);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedSessions = selectedKey ? byDate.get(selectedKey) ?? [] : [];

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold">Training Calendar</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedKey(null); }}
            className="w-6 h-6 rounded-full bg-[#0f0f0f] flex items-center justify-center text-[#888] text-xs"
          >‹</button>
          <span className="text-white text-xs font-semibold w-24 text-center">{monthLabel}</span>
          <button
            onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedKey(null); }}
            className="w-6 h-6 rounded-full bg-[#0f0f0f] flex items-center justify-center text-[#888] text-xs"
          >›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-[#555] font-semibold py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toDateKey(year, month, day);
          const sessionsToday = byDate.get(key);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          return (
            <button
              key={i}
              onClick={() => sessionsToday && setSelectedKey(isSelected ? null : key)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                isSelected ? 'bg-[#4ade80]/20 border border-[#4ade80]' :
                sessionsToday ? 'bg-[#14532d]/40 border border-[#14532d]' :
                isToday ? 'border border-[#444]' : ''
              }`}
            >
              <span className={sessionsToday ? 'text-[#4ade80] font-bold' : isToday ? 'text-white font-bold' : 'text-[#666]'}>{day}</span>
              {sessionsToday && <span className="w-1 h-1 rounded-full bg-[#4ade80]" />}
            </button>
          );
        })}
      </div>

      {selectedSessions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#2a2a2a] space-y-1.5">
          {selectedSessions.map((num) => {
            const s = SESSIONS.find((s) => s.sessionNum === num);
            if (!s) return null;
            return (
              <p key={num} className="text-[12px] text-[#ccc]">
                <span className="text-[#4ade80] font-semibold">Session {num}</span> — {s.label}
              </p>
            );
          })}
        </div>
      )}

      {byDate.size === 0 && (
        <p className="text-[11px] text-[#666] text-center mt-3">Completed sessions will show up here on the day you did them.</p>
      )}
    </div>
  );
}
