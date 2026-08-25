'use client';
import { useState, useEffect } from 'react';
import { profileKey, type ProfileId } from '@/lib/profiles';

interface Entry {
  weight: number;  // kg
  date: string;    // YYYY-MM-DD
}

interface Props {
  profileId: ProfileId;
}

// Shared with the goal/body-stats card so weight has one source of truth —
// whatever was last logged here is what BMI/protein math uses elsewhere.
export function readLatestWeight(profileId: ProfileId): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(profileKey(profileId, 'body_weight'));
    const entries: Entry[] = raw ? JSON.parse(raw) : [];
    return entries[0]?.weight ?? null;
  } catch {
    return null;
  }
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function daysBetween(a: string, b: string) {
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  return Math.round((tb - ta) / 86400000);
}

// Simple SVG sparkline
function Sparkline({ entries }: { entries: Entry[] }) {
  if (entries.length < 2) return null;
  const pts = [...entries].reverse(); // oldest first
  const weights = pts.map(e => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const W = 220, H = 48, PAD = 6;
  const xs = pts.map((_, i) => PAD + (i / (pts.length - 1)) * (W - PAD * 2));
  const ys = pts.map(e => H - PAD - ((e.weight - minW) / range) * (H - PAD * 2));

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const fill = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
    + ` L${xs[xs.length-1].toFixed(1)},${H} L${PAD},${H} Z`;

  const isDown = pts[pts.length-1].weight <= pts[0].weight;
  const color = isDown ? '#4ade80' : '#f87171';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 48 }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#sg)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r={i === pts.length - 1 ? 3.5 : 2}
          fill={i === pts.length - 1 ? color : '#333'} />
      ))}
    </svg>
  );
}

export default function BodyWeightTracker({ profileId }: Props) {
  const storageKey = profileKey(profileId, 'body_weight');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(storageKey);
      setEntries(s ? JSON.parse(s) : []);
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  const save = (updated: Entry[]) => {
    setEntries(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  };

  const logWeight = () => {
    const kg = parseFloat(input);
    if (isNaN(kg) || kg < 20 || kg > 300) return;
    const today = todayISO();
    // replace if already logged today
    const without = entries.filter(e => e.date !== today);
    const updated = [{ weight: kg, date: today }, ...without]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 52); // keep ~1 year
    save(updated);
    setInput('');
  };

  const removeEntry = (date: string) => save(entries.filter(e => e.date !== date));

  if (!loaded) return null;

  const today = todayISO();
  const latest = entries[0];
  const first = entries[entries.length - 1];
  const totalChange = latest && first ? latest.weight - first.weight : null;
  const alreadyLoggedToday = latest?.date === today;

  // Next weigh-in logic (weekly cadence)
  let nextWeighIn: { label: string; urgent: boolean } = { label: 'Log your first weigh-in', urgent: true };
  if (latest) {
    if (alreadyLoggedToday) {
      const nextDate = addDays(today, 7);
      nextWeighIn = { label: `Next weigh-in: ${formatDate(nextDate)} (in 7 days)`, urgent: false };
    } else {
      const daysSince = daysBetween(latest.date, today);
      if (daysSince >= 7) {
        nextWeighIn = { label: `Ready to weigh in! (${daysSince} days since last)`, urgent: true };
      } else {
        const daysLeft = 7 - daysSince;
        const nextDate = addDays(latest.date, 7);
        nextWeighIn = { label: `Next weigh-in in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${formatDate(nextDate)})`, urgent: false };
      }
    }
  }

  // Projected end weight (simple linear extrapolation from first to latest)
  let projection: string | null = null;
  if (entries.length >= 2 && first && latest && first.date !== latest.date) {
    const days = daysBetween(first.date, latest.date);
    const ratePerDay = (latest.weight - first.weight) / days;
    const daysLeft = Math.max(0, 84 - daysBetween(first.date, today)); // 84 = 12 weeks
    if (daysLeft > 0) {
      const projected = latest.weight + ratePerDay * daysLeft;
      projection = projected.toFixed(1);
    }
  }

  const recentEntries = showAll ? entries : entries.slice(0, 4);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Body Weight</p>
          {entries.length > 4 && (
            <button onClick={() => setShowAll(!showAll)} className="text-[11px] text-[#60a5fa] font-semibold">
              {showAll ? 'Show less' : `All (${entries.length})`}
            </button>
          )}
        </div>

        {/* Stats row */}
        {latest ? (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{latest.weight} kg</p>
              <p className="text-[10px] text-[#888] mt-0.5">Current</p>
            </div>
            <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{first.weight} kg</p>
              <p className="text-[10px] text-[#888] mt-0.5">Starting</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${
              totalChange === null ? 'bg-[#0f0f0f]' :
              totalChange < 0 ? 'bg-[#14532d]/30' : totalChange > 0 ? 'bg-[#7f1d1d]/30' : 'bg-[#0f0f0f]'
            }`}>
              <p className={`font-bold text-lg ${
                totalChange === null ? 'text-[#888]' :
                totalChange < 0 ? 'text-[#4ade80]' : totalChange > 0 ? 'text-[#f87171]' : 'text-white'
              }`}>
                {totalChange === null ? '—' : totalChange === 0 ? '0 kg' :
                  `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg`}
              </p>
              <p className="text-[10px] text-[#888] mt-0.5">Total</p>
            </div>
          </div>
        ) : null}

        {/* Sparkline */}
        {entries.length >= 2 && (
          <div className="mb-3">
            <Sparkline entries={entries.slice(0, 10)} />
          </div>
        )}

        {/* Projected end weight */}
        {projection && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-3 py-2 mb-3">
            <p className="text-[11px] text-[#888] leading-relaxed">
              At your current rate → projected finish weight:{' '}
              <span className={`font-bold ${totalChange !== null && totalChange < 0 ? 'text-[#4ade80]' : 'text-[#facc15]'}`}>
                {projection} kg
              </span>
              {' '}by end of Week 12
            </p>
          </div>
        )}

        {/* Next weigh-in banner */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3 ${
          nextWeighIn.urgent ? 'bg-[#facc15]/10 border border-[#facc15]/30' : 'bg-[#0f0f0f] border border-[#2a2a2a]'
        }`}>
          <span className="text-base">{nextWeighIn.urgent ? '⚖️' : '📅'}</span>
          <div>
            <p className={`text-xs font-semibold ${nextWeighIn.urgent ? 'text-[#facc15]' : 'text-[#ccc]'}`}>
              {nextWeighIn.label}
            </p>
            {!alreadyLoggedToday && (
              <p className="text-[10px] text-[#666] mt-0.5">Morning · after bathroom · before eating</p>
            )}
          </div>
        </div>

        {/* Log form */}
        <div className="flex gap-2 mb-1">
          <input
            type="number"
            inputMode="decimal"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={alreadyLoggedToday ? `Logged today (${latest?.weight} kg) — update?` : 'Your weight in kg (e.g. 72.5)'}
            className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#444]"
            onKeyDown={e => e.key === 'Enter' && logWeight()}
          />
          <button
            onClick={logWeight}
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#4ade80] text-black font-bold text-sm disabled:opacity-30"
          >
            Log
          </button>
        </div>
      </div>

      {/* History list */}
      {entries.length > 0 && (
        <div className="border-t border-[#2a2a2a] mt-1">
          {recentEntries.map((e, i) => {
            const prev = entries[i + 1];
            const diff = prev ? e.weight - prev.weight : null;
            return (
              <div key={e.date}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1e1e1e] last:border-0">
                <div className="flex-1">
                  <span className="text-white font-semibold text-sm">{e.weight} kg</span>
                  <span className="text-[#666] text-xs ml-2">{formatDate(e.date)}</span>
                </div>
                {diff !== null && (
                  <span className={`text-xs font-bold ${diff < 0 ? 'text-[#4ade80]' : diff > 0 ? 'text-[#f87171]' : 'text-[#888]'}`}>
                    {diff > 0 ? `+${diff.toFixed(1)}` : diff === 0 ? '—' : diff.toFixed(1)} kg
                  </span>
                )}
                <button onClick={() => removeEntry(e.date)} className="text-[#555] hover:text-[#f87171] text-xs ml-1">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-[11px] text-[#666] text-center leading-relaxed">
            Weigh yourself weekly — same time, same conditions. Morning after bathroom is most accurate.
          </p>
        </div>
      )}
    </div>
  );
}
