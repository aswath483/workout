'use client';
import { SESSIONS } from '@/data/workoutData';

interface Props {
  completedSessions: number[];
  onReset: () => void;
}

const PHASE_META = [
  { fill: '#4ade80', bg: '#14532d33', border: '#14532d', label: 'Phase 1 — Foundation',  range: [1, 6]  as [number,number] },
  { fill: '#facc15', bg: '#713f1233', border: '#713f12', label: 'Phase 2 — Growth',       range: [7, 12] as [number,number] },
  { fill: '#f87171', bg: '#7f1d1d33', border: '#7f1d1d', label: 'Phase 3 — Aesthetic',    range: [13,18] as [number,number] },
];

const TYPE_ICON: Record<string, string> = { strength: '💪', cardio: '🏃', hiit: '⚡' };

export default function ProgressScreen({ completedSessions, onReset }: Props) {
  const total = completedSessions.length;
  const nextSession = SESSIONS.find(s => !completedSessions.includes(s.sessionNum));

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Overall progress */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-lg">{total}/18 Sessions Done</p>
            <p className="text-[#888] text-xs mt-0.5">
              {total === 18
                ? '12-Week Transformation Complete!'
                : nextSession
                  ? `Next up: Session ${nextSession.sessionNum} · ${nextSession.label}`
                  : 'All sessions complete!'}
            </p>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#2a2a2a" strokeWidth="6" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="#4ade80" strokeWidth="6"
                strokeDasharray={`${(total / 18) * 138.2} 138.2`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {Math.round((total / 18) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Session grid */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">Session Grid</p>
        <div className="space-y-3">
          {PHASE_META.map((ph, pi) => {
            const phaseSessions = SESSIONS.filter(s => s.phase === (pi + 1) as 1|2|3);
            const donePh = phaseSessions.filter(s => completedSessions.includes(s.sessionNum)).length;
            return (
              <div key={pi}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold" style={{ color: ph.fill }}>{ph.label}</p>
                  <span className="text-[#888] text-xs">{donePh}/6</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {phaseSessions.map(s => {
                    const isDone = completedSessions.includes(s.sessionNum);
                    const isNext = s.sessionNum === nextSession?.sessionNum;
                    return (
                      <div key={s.sessionNum}
                        className="rounded-xl p-2 text-center"
                        style={{
                          background: isDone ? ph.bg : isNext ? '#222' : '#111',
                          border: `1px solid ${isDone ? ph.fill : isNext ? '#555' : '#2a2a2a'}`,
                        }}>
                        <span className="block text-[8px]" style={{ color: ph.fill }}>
                          {TYPE_ICON[s.type]}
                        </span>
                        <span className="block text-sm font-bold mt-0.5"
                          style={{ color: isDone ? ph.fill : isNext ? '#fff' : '#555' }}>
                          {isDone ? '✓' : s.sessionNum}
                        </span>
                        {isNext && <span className="block text-[7px] text-[#60a5fa] mt-0.5">NEXT</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase progress bars */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 space-y-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold">Phase Progress</p>
        {PHASE_META.map((ph, i) => {
          const done = SESSIONS.filter(s => s.phase === (i+1) as 1|2|3 && completedSessions.includes(s.sessionNum)).length;
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-white text-sm font-semibold">{ph.label}</p>
                <span className="text-white font-bold text-sm">{done}/6</span>
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(done / 6) * 100}%`, background: ph.fill }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight progression guide */}
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
