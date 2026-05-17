'use client';
import { useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onDone, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (freq: number, dur: number, vol: number) => {
    try {
      if (!audioCtxRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioCtxRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch { /* audio blocked or unavailable */ }
  };

  // Countdown beeps — soft ticks 10→4 sec, sharp beeps 3→1 sec
  useEffect(() => {
    if (timeLeft <= 0 || timeLeft > 10) return;
    if (timeLeft <= 3) {
      playBeep(880, 0.15, 0.5);
    } else {
      playBeep(550, 0.07, 0.2);
    }
  // playBeep only touches a ref — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (!doneRef.current) {
            doneRef.current = true;
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            // Two-tone "done" sound
            setTimeout(() => playBeep(660, 0.25, 0.4), 0);
            setTimeout(() => playBeep(880, 0.25, 0.4), 180);
            setTimeout(onDone, 300);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const isAlert = timeLeft > 0 && timeLeft <= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 flex flex-col items-center gap-5 w-80 max-w-[90vw]">
        <p className="text-[#888] text-sm font-semibold uppercase tracking-widest">Rest Time</p>

        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#2a2a2a" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={r} fill="none"
              stroke={isAlert ? '#f87171' : '#4ade80'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
            />
          </svg>
          <span className="text-4xl font-bold tabular-nums" style={{ color: isAlert ? '#f87171' : 'white' }}>
            {display}
          </span>
        </div>

        <p className={`text-xs text-center font-semibold -mt-2 transition-colors ${isAlert ? 'text-[#f87171] animate-pulse' : 'text-[#888]'}`}>
          {isAlert ? 'Get ready — next set soon!' : timeLeft > 0 ? 'Next set starts when timer ends' : 'Go!'}
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
