'use client';
import { useState, useEffect } from 'react';
import { profileKey, type ProfileId } from '@/lib/profiles';

interface WeightLogEntry {
  weight: string;
  date: string;
  notes: string;
}

interface Props {
  exerciseKey: string; // e.g. "p1-Mon-0"
  exerciseName: string;
  suggestedWeight: string;
  profileId: ProfileId;
}

export default function WeightLogger({ exerciseKey, exerciseName, suggestedWeight, profileId }: Props) {
  const storageKey = profileKey(profileId, `wlog_${exerciseKey}`);
  const [log, setLog] = useState<WeightLogEntry[]>([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setLog(JSON.parse(stored));
    } catch {}
  }, [storageKey]);

  const save = () => {
    if (!weight.trim()) return;
    const entry: WeightLogEntry = {
      weight: weight.trim(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      notes: notes.trim(),
    };
    const updated = [entry, ...log].slice(0, 10); // keep last 10
    setLog(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
    setWeight('');
    setNotes('');
  };

  const lastEntry = log[0];
  const prevEntry = log[1];

  const weightDiff = lastEntry && prevEntry
    ? (() => {
        const last = parseFloat(lastEntry.weight);
        const prev = parseFloat(prevEntry.weight);
        if (isNaN(last) || isNaN(prev)) return null;
        const diff = last - prev;
        return diff;
      })()
    : null;

  return (
    <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Weight Log</p>
        {log.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] text-[#60a5fa] font-semibold"
          >
            {showHistory ? 'Hide' : `History (${log.length})`}
          </button>
        )}
      </div>

      {lastEntry && (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#1a1a1a] rounded-xl p-3">
            <p className="text-[10px] text-[#888]">Last session</p>
            <p className="text-white font-bold text-base">{lastEntry.weight}</p>
            <p className="text-[10px] text-[#888] mt-0.5">{lastEntry.date}</p>
          </div>
          {weightDiff !== null && (
            <div className={`rounded-xl px-3 py-2 text-center ${weightDiff > 0 ? 'bg-[#14532d]/40' : weightDiff < 0 ? 'bg-[#7f1d1d]/40' : 'bg-[#2a2a2a]'}`}>
              <p className={`text-sm font-bold ${weightDiff > 0 ? 'text-[#4ade80]' : weightDiff < 0 ? 'text-[#f87171]' : 'text-[#888]'}`}>
                {weightDiff > 0 ? `+${weightDiff.toFixed(1)}` : weightDiff === 0 ? '=' : weightDiff.toFixed(1)}
              </p>
              <p className="text-[9px] text-[#888] mt-0.5">vs last</p>
            </div>
          )}
        </div>
      )}

      {!lastEntry && (
        <p className="text-[12px] text-[#888]">
          Suggested: <span className="text-white font-semibold">{suggestedWeight}</span> — log what you actually used after each session.
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={`Weight used (e.g. ${suggestedWeight})`}
          className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#444]"
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <button
          onClick={save}
          disabled={!weight.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#4ade80] text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#22c55e] transition-colors"
        >
          Log
        </button>
      </div>

      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional note (e.g. felt easy, form was off...)"
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#444]"
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />

      {showHistory && log.length > 0 && (
        <div className="space-y-1.5 mt-1">
          {log.map((entry, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-3 py-2">
              <div>
                <span className="text-white text-sm font-semibold">{entry.weight}</span>
                {entry.notes && <span className="text-[#888] text-xs ml-2">— {entry.notes}</span>}
              </div>
              <span className="text-[#888] text-[11px]">{entry.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
