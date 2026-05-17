'use client';
import { useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onDone, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (!doneRef.current) {
            doneRef.current = true;
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            setTimeout(onDone, 300);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, onDone]);

  const adjust = (delta: number) => {
    setTimeLeft((prev) => Math.max(5, prev + delta));
  };

  const pct = Math.max(0, (timeLeft / seconds) * 100);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 flex flex-col items-center gap-6 w-80 max-w-[90vw]">
        <p className="text-[#888] text-sm font-semibold uppercase tracking-widest">Rest Time</p>

        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#2a2a2a" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={r} fill="none"
              stroke={timeLeft <= 10 ? '#f87171' : '#4ade80'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
            />
          </svg>
          <span className="text-4xl font-bold tabular-nums">{display}</span>
        </div>

        <p className="text-[#888] text-xs text-center">
          {timeLeft > 0 ? 'Next set starts when timer ends' : 'Go!'}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => adjust(-15)}
            className="flex-1 py-2 rounded-xl bg-[#2a2a2a] text-[#888] text-sm font-semibold hover:bg-[#333] transition-colors"
          >
            −15s
          </button>
          <button
            onClick={() => adjust(30)}
            className="flex-1 py-2 rounded-xl bg-[#2a2a2a] text-[#888] text-sm font-semibold hover:bg-[#333] transition-colors"
          >
            +30s
          </button>
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 rounded-xl bg-[#4ade80] text-black font-bold text-sm hover:bg-[#22c55e] transition-colors"
        >
          Skip — I&apos;m Ready
        </button>
      </div>
    </div>
  );
}
