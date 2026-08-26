'use client';
import { useState, useEffect } from 'react';
import { PAIN_AREAS } from '@/data/workoutData';
import { readPainHistory, summarizePainHistory, type PainAreaSummary } from '@/lib/painHistory';
import type { ProfileId } from '@/lib/profiles';

interface Props {
  profileId: ProfileId;
}

function areaLabel(area: PainAreaSummary['area']): string {
  return PAIN_AREAS.find((a) => a.id === area)?.label ?? area;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function PainHistoryTrend({ profileId }: Props) {
  const [summary, setSummary] = useState<PainAreaSummary[] | null>(null);

  useEffect(() => {
    setSummary(summarizePainHistory(readPainHistory(profileId), 30));
  }, [profileId]);

  if (summary === null || summary.length === 0) return null;

  const top = summary[0];
  const maxCount = top.count;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-1">Pain Trend · Last 30 Days</p>
      <p className="text-[11px] text-[#666] mb-3 leading-relaxed">
        How often each area has actually affected a session — not just whether it's flagged right now.
      </p>
      <div className="space-y-2.5">
        {summary.map((s) => (
          <div key={s.area}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm font-semibold">{areaLabel(s.area)}</span>
              <span className="text-[#888] text-xs">
                {s.count}× · last {formatDate(s.lastDate)}
              </span>
            </div>
            <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#f87171]"
                style={{ width: `${Math.max(8, (s.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {top.count >= 4 && (
        <p className="text-[11px] text-[#facc15] mt-3 leading-relaxed">
          {areaLabel(top.area)} has come up {top.count} times this month — worth mentioning to a professional if it isn't easing off.
        </p>
      )}
    </div>
  );
}
