'use client';
import { useEffect, useRef, useState } from 'react';
import type { HIITDay } from '@/data/workoutData';

interface HIITTimerProps {
  data: HIITDay;
}

type Phase = 'idle' | 'work' | 'rest' | 'done';

export default function HIITTimer({ data }: HIITTimerProps) {
  const { rounds, workSeconds, restSeconds, exercises } = data;
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startWork = (r: number) => {
    setRound(r);
    setPhase('work');
    setTimeLeft(workSeconds);
  };

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          if (phase === 'work') {
            if (round >= rounds) {
              if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
              setPhase('done');
            } else {
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
              setPhase('rest');
              setTimeLeft(restSeconds);
            }
          } else {
            if (navigator.vibrate) navigator.vibrate([200]);
            startWork(round + 1);
          }
          return phase === 'work' ? restSeconds : workSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  const stop = () => {
    clearTimer();
    setPhase('idle');
    setRound(1);
    setTimeLeft(workSeconds);
  };

  const isWork = phase === 'work';
  const isDone = phase === 'done';
  const isIdle = phase === 'idle';

  const phaseDuration = isWork ? workSeconds : restSeconds;
  const pct = Math.max(0, (timeLeft / phaseDuration) * 100);
  const r = 60;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-5 transition-colors duration-500 ${
        isWork ? 'bg-[#14532d33] border-[#4ade80]' :
        phase === 'rest' ? 'bg-[#1e3a5f33] border-[#60a5fa]' :
        'bg-[#1a1a1a] border-[#2a2a2a]'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[#888] uppercase tracking-widest font-semibold">HIIT Session</p>
            <p className="text-white font-bold text-lg mt-0.5">
              {isDone ? 'Session Complete!' : isIdle ? 'Ready to start' :
               isWork ? `Round ${round} of ${rounds} — GO!` : `Round ${round} done — Rest`}
            </p>
          </div>
          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
            isWork ? 'bg-[#4ade80] text-black' :
            phase === 'rest' ? 'bg-[#60a5fa] text-black' :
            'bg-[#2a2a2a] text-[#888]'
          }`}>
            {isWork ? 'WORK' : phase === 'rest' ? 'REST' : isDone ? 'DONE' : 'READY'}
          </div>
        </div>

        {!isIdle && !isDone && (
          <div className="flex flex-col items-center gap-4 my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={r} fill="none" stroke="#2a2a2a" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r={r} fill="none"
                  stroke={isWork ? '#4ade80' : '#60a5fa'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circ}`}
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <div className="text-center">
                <p className="text-5xl font-bold tabular-nums leading-none">{timeLeft}</p>
                <p className="text-xs text-[#888] mt-1">{isWork ? 'sec work' : 'sec rest'}</p>
              </div>
            </div>

            <div className="w-full flex gap-1">
              {Array.from({ length: rounds }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    i + 1 < round ? 'bg-[#4ade80]' :
                    i + 1 === round ? (isWork ? 'bg-[#4ade80]' : 'bg-[#60a5fa]') :
                    'bg-[#2a2a2a]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {isDone && (
          <div className="text-center py-4">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-[#4ade80] font-bold">All {rounds} rounds complete!</p>
            <p className="text-[#888] text-sm mt-1">Rest for 5 min, then continue</p>
          </div>
        )}
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
        <p className="text-xs text-[#888] font-semibold uppercase tracking-widest mb-3">Protocol</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#4ade80]">{rounds}</p>
            <p className="text-xs text-[#888] mt-0.5">Total Rounds</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{workSeconds}s</p>
            <p className="text-xs text-[#888] mt-0.5">Work Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#60a5fa]">{restSeconds}s</p>
            <p className="text-xs text-[#888] mt-0.5">Rest Time</p>
          </div>
        </div>
        <p className="text-xs text-[#888] mb-2 font-semibold">Choose one exercise per round:</p>
        <div className="flex gap-2 flex-wrap">
          {exercises.map((ex) => (
            <span key={ex} className="px-3 py-1 bg-[#2a2a2a] text-[#f1f1f1] text-xs rounded-lg font-medium">
              {ex}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-sm text-[#888] space-y-1">
        <p><span className="text-white font-semibold">Rest between rounds?</span> YES — the {restSeconds}s is your rest between rounds.</p>
        <p>Work 20s → Rest {restSeconds}s → Work 20s → Rest {restSeconds}s → repeat {rounds} times.</p>
        <p className="text-[#4ade80]">Total time ≈ {Math.round((rounds * (workSeconds + restSeconds)) / 60)} minutes</p>
      </div>

      <div className="flex gap-3">
        {(isIdle || isDone) ? (
          <button
            onClick={() => startWork(1)}
            className="flex-1 py-4 rounded-2xl bg-[#4ade80] text-black font-bold text-base hover:bg-[#22c55e] transition-colors"
          >
            {isDone ? 'Repeat Session' : 'Start HIIT Timer'}
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 py-4 rounded-2xl bg-[#2a2a2a] text-[#f87171] font-bold text-base hover:bg-[#333] transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
