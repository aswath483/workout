'use client';
import { useState } from 'react';
import { SESSIONS } from '@/data/workoutData';
import { MOODS, type SessionNote } from './WorkoutScreen';
import BodyWeightTracker from './BodyWeightTracker';
import TrainingCalendar from './TrainingCalendar';
import PainHistoryTrend from './PainHistoryTrend';
import { profileKey, type ProfileId } from '@/lib/profiles';

interface Props {
  completedSessions: number[];
  onReset: () => void;
  profileId: ProfileId;
  sessionDates: Record<number, string>;
}

const PHASE_META = [
  { fill: '#4ade80', bg: '#14532d33', label: 'Phase 1 — Foundation',  phase: 1 as const },
  { fill: '#facc15', bg: '#713f1233', label: 'Phase 2 — Growth',       phase: 2 as const },
  { fill: '#f87171', bg: '#7f1d1d33', label: 'Phase 3 — Aesthetic',    phase: 3 as const },
];

const TYPE_ICON: Record<string, string> = { strength: '💪', cardio: '🏃', hiit: '⚡' };
const TYPE_COLOR: Record<string, string> = {
  strength: 'text-[#60a5fa]',
  cardio:   'text-[#4ade80]',
  hiit:     'text-[#facc15]',
};
const DAY_SHORT = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];

export default function ProgressScreen({ completedSessions, onReset, profileId, sessionDates }: Props) {
  const total = completedSessions.length;
  const nextSession = SESSIONS.find(s => !completedSessions.includes(s.sessionNum));

  const [sessionNotes] = useState<Record<number, SessionNote>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(profileKey(profileId, 'session_notes')) || '{}'); } catch { return {}; }
  });

  // Breakdown by type
  const completedInfo = completedSessions.map(n => SESSIONS.find(s => s.sessionNum === n)).filter(Boolean) as typeof SESSIONS;
  const strengthDone = completedInfo.filter(s => s.type === 'strength').length;
  const cardioDone   = completedInfo.filter(s => s.type === 'cardio').length;
  const hiitDone     = completedInfo.filter(s => s.type === 'hiit').length;

  // Sessions with notes, newest first
  const logEntries = completedSessions
    .map(n => ({ session: SESSIONS.find(s => s.sessionNum === n)!, note: sessionNotes[n] ?? null }))
    .filter(x => x.session)
    .sort((a, b) => b.session.sessionNum - a.session.sessionNum);

  // Mood distribution
  const moodCounts = MOODS.map(m => ({
    ...m,
    count: Object.values(sessionNotes).filter(n => n.mood === m.value).length,
  })).filter(m => m.count > 0);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Body Weight Tracker */}
      <BodyWeightTracker profileId={profileId} />

      {/* Training Calendar */}
      <TrainingCalendar sessionDates={sessionDates} />

      {/* Pain History Trend */}
      <PainHistoryTrend profileId={profileId} />

      {/* Overall ring */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-lg">{total}/72 Sessions Done</p>
            <p className="text-[#888] text-xs mt-0.5">
              {total === 72
                ? '12-Week Transformation Complete!'
                : nextSession
                  ? `Next: Session ${nextSession.sessionNum} · Week ${nextSession.programWeek} · ${nextSession.label}`
                  : 'All done!'}
            </p>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#2a2a2a" strokeWidth="6" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="#4ade80" strokeWidth="6"
                strokeDasharray={`${(total / 72) * 138.2} 138.2`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {Math.round((total / 72) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Workout type breakdown */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">Sessions by Type</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Strength', icon: '💪', done: strengthDone, total: 24, color: '#60a5fa' },
            { label: 'Cardio',   icon: '🏃', done: cardioDone,   total: 24, color: '#4ade80' },
            { label: 'HIIT',     icon: '⚡', done: hiitDone,     total: 24, color: '#facc15' },
          ].map(t => (
            <div key={t.label} className="bg-[#0f0f0f] rounded-xl p-3 text-center">
              <p className="text-xl mb-1">{t.icon}</p>
              <p className="text-white font-bold text-base">{t.done}<span className="text-[#555] font-normal text-xs">/{t.total}</span></p>
              <p className="text-[10px] text-[#888] mt-0.5">{t.label}</p>
              <div className="h-1 bg-[#2a2a2a] rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(t.done / t.total) * 100}%`, background: t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood summary — only shown if any notes exist */}
      {moodCounts.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
          <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">How Sessions Felt</p>
          <div className="flex gap-2 flex-wrap">
            {moodCounts.map(m => (
              <div key={m.value} className="flex items-center gap-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-3 py-2">
                <span className="text-xl">{m.emoji}</span>
                <div>
                  <p className="text-white font-bold text-sm leading-none">{m.count}</p>
                  <p className="text-[10px] text-[#888] mt-0.5">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-week × 6-day grid */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">12-Week Grid</p>

        {/* Day column headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          <div /> {/* week label column */}
          {DAY_SHORT.map(d => (
            <div key={d} className="text-center text-[9px] text-[#555] font-semibold">{d}</div>
          ))}
        </div>

        {/* Rows: one per program week */}
        <div className="space-y-1">
          {Array.from({ length: 12 }).map((_, wi) => {
            const programWeek = wi + 1;
            const ph = programWeek <= 4 ? 1 : programWeek <= 8 ? 2 : 3;
            const fill = PHASE_META[ph - 1].fill;
            const bg = PHASE_META[ph - 1].bg;
            const weekSessions = SESSIONS.filter(s => s.programWeek === programWeek);
            return (
              <div key={programWeek} className="grid grid-cols-7 gap-1 items-center">
                <div className="text-[9px] font-bold pr-1" style={{ color: fill }}>W{programWeek}</div>
                {weekSessions.map(s => {
                  const isDone = completedSessions.includes(s.sessionNum);
                  const isNext = s.sessionNum === nextSession?.sessionNum;
                  const note = sessionNotes[s.sessionNum];
                  const moodEmoji = note ? MOODS.find(m => m.value === note.mood)?.emoji : null;
                  return (
                    <div key={s.sessionNum}
                      className="rounded-lg py-1.5 flex flex-col items-center gap-0.5"
                      style={{
                        background: isDone ? bg : isNext ? '#222' : '#111',
                        border: `1px solid ${isDone ? fill : isNext ? '#555' : '#1e1e1e'}`,
                      }}>
                      {moodEmoji ? (
                        <span className="text-[10px] leading-none">{moodEmoji}</span>
                      ) : (
                        <span className="text-[8px] leading-none">{TYPE_ICON[s.type]}</span>
                      )}
                      <span className="text-[9px] font-bold leading-none"
                        style={{ color: isDone ? fill : isNext ? '#fff' : '#444' }}>
                        {isDone ? '✓' : isNext ? '→' : s.sessionNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Phase legend */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-[#2a2a2a]">
          {PHASE_META.map(ph => (
            <div key={ph.phase} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: ph.fill }} />
              <span className="text-[10px] text-[#888]">P{ph.phase} Wk {(ph.phase-1)*4+1}–{ph.phase*4}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase progress bars */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 space-y-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold">Phase Progress</p>
        {PHASE_META.map(ph => {
          const done = SESSIONS.filter(s => s.phase === ph.phase && completedSessions.includes(s.sessionNum)).length;
          return (
            <div key={ph.phase}>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-white text-sm font-semibold">{ph.label}</p>
                <span className="text-white font-bold text-sm">{done}/24</span>
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(done / 24) * 100}%`, background: ph.fill }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Session log */}
      {logEntries.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <p className="text-xs text-[#888] uppercase tracking-widest font-semibold px-4 pt-4 pb-3">Session Log</p>
          <div className="divide-y divide-[#1e1e1e]">
            {logEntries.map(({ session: s, note }) => {
              const phFill = PHASE_META[s.phase - 1].fill;
              const moodData = note ? MOODS.find(m => m.value === note.mood) : null;
              return (
                <div key={s.sessionNum} className="px-4 py-3 flex items-start gap-3">
                  {/* Session number badge */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: PHASE_META[s.phase - 1].bg, border: `1.5px solid ${phFill}`, color: phFill }}>
                    {s.sessionNum}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${TYPE_COLOR[s.type]}`}>
                        {TYPE_ICON[s.type]} {s.label}
                      </span>
                      <span className="text-[10px] text-[#555]">Wk {s.programWeek}</span>
                    </div>
                    {note?.note && (
                      <p className="text-[#888] text-xs mt-1 leading-relaxed">{note.note}</p>
                    )}
                    {note?.date && (
                      <p className="text-[10px] text-[#444] mt-0.5">
                        {new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {moodData && (
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="text-xl">{moodData.emoji}</span>
                      <span className="text-[9px] text-[#555] mt-0.5">{moodData.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weight progression rule */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">Weight Progression Rule</p>
        <div className="space-y-2">
          {[
            { icon: '✓', text: 'Completed all sets easily 2 sessions in a row?', color: '#4ade80' },
            { icon: '→', text: 'Add 2.5 kg total to the bar (barbell) or 1 kg per dumbbell', color: '#facc15' },
            { icon: '→', text: 'OR add 1–2 extra reps per set instead', color: '#facc15' },
            { icon: '!', text: 'Form breaking down? Drop the weight. Never sacrifice form.', color: '#f87171' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.icon}</span>
              <span className="text-[#ccc] text-sm leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => { if (window.confirm('Reset all progress? This cannot be undone.')) onReset(); }}
        className="w-full py-3 rounded-2xl border border-[#7f1d1d] text-[#f87171] text-sm font-semibold hover:bg-[#7f1d1d]/20 transition-colors"
      >
        Reset All Progress
      </button>
    </div>
  );
}
