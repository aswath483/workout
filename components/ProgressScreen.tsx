'use client';

interface Props {
  completedWeeks: number[];
  onToggleWeek: (w: number) => void;
  onReset: () => void;
}

export default function ProgressScreen({ completedWeeks, onToggleWeek, onReset }: Props) {
  const done1 = completedWeeks.filter((w) => w <= 4).length;
  const done2 = completedWeeks.filter((w) => w > 4 && w <= 8).length;
  const done3 = completedWeeks.filter((w) => w > 8).length;
  const totalDone = completedWeeks.length;

  const getCurrentWeek = () => {
    for (let w = 1; w <= 12; w++) if (!completedWeeks.includes(w)) return w;
    return 12;
  };
  const currentWeek = getCurrentWeek();

  const phaseColors = [
    { fill: '#4ade80', bg: '#14532d33', border: '#14532d', label: 'Phase 1 — Foundation', weeks: 'Weeks 1–4', count: done1 },
    { fill: '#facc15', bg: '#713f1233', border: '#713f12', label: 'Phase 2 — Growth', weeks: 'Weeks 5–8', count: done2 },
    { fill: '#f87171', bg: '#7f1d1d33', border: '#7f1d1d', label: 'Phase 3 — Aesthetic', weeks: 'Weeks 9–12', count: done3 },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-lg">{totalDone}/12 Weeks Done</p>
            <p className="text-[#888] text-xs mt-0.5">
              {totalDone === 12 ? '12-Week Transformation Complete!' : `Currently on Week ${currentWeek}`}
            </p>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#2a2a2a" strokeWidth="6" />
              <circle
                cx="28" cy="28" r="22" fill="none" stroke="#4ade80" strokeWidth="6"
                strokeDasharray={`${(totalDone / 12) * 138.2} 138.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {Math.round((totalDone / 12) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">12-Week Grid</p>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const w = i + 1;
            const ph = w <= 4 ? 0 : w <= 8 ? 1 : 2;
            const isDone = completedWeeks.includes(w);
            const isCurrent = w === currentWeek && !isDone;
            const c = phaseColors[ph];
            return (
              <button
                key={w}
                onClick={() => onToggleWeek(w)}
                className="rounded-xl p-3 text-center transition-all active:scale-95"
                style={{
                  background: isDone ? c.bg : isCurrent ? '#222' : '#111',
                  border: `1px solid ${isDone ? c.fill : isCurrent ? '#555' : '#2a2a2a'}`,
                }}
              >
                <span className="block text-[10px] text-[#888]">Week</span>
                <span
                  className="block text-base font-bold mt-0.5"
                  style={{ color: isDone ? c.fill : isCurrent ? '#fff' : '#666' }}
                >
                  {w}
                </span>
                {isDone && <span className="block text-[8px] mt-0.5" style={{ color: c.fill }}>✓</span>}
                {isCurrent && <span className="block text-[8px] text-[#60a5fa] mt-0.5">NOW</span>}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[#888] text-center mt-2">Tap a week to mark it complete</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 space-y-4">
        <p className="text-xs text-[#888] uppercase tracking-widest font-semibold">Phase Progress</p>
        {phaseColors.map((c, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <p className="text-white text-sm font-semibold">{c.label}</p>
                <p className="text-[#888] text-[11px]">{c.weeks}</p>
              </div>
              <span className="text-white font-bold text-sm">{c.count}/4</span>
            </div>
            <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(c.count / 4) * 100}%`, background: c.fill }}
              />
            </div>
          </div>
        ))}
      </div>

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
        onClick={() => {
          if (window.confirm('Reset all progress? This cannot be undone.')) onReset();
        }}
        className="w-full py-3 rounded-2xl border border-[#7f1d1d] text-[#f87171] text-sm font-semibold hover:bg-[#7f1d1d]/20 transition-colors"
      >
        Reset All Progress
      </button>
    </div>
  );
}
