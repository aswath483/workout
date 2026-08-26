import { profileKey, type ProfileId } from '@/lib/profiles';
import type { PainArea } from '@/data/workoutData';

export interface PainOccurrence {
  area: PainArea;
  date: string; // YYYY-MM-DD
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function readPainHistory(profileId: ProfileId): PainOccurrence[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(profileKey(profileId, 'pain_history')) || '[]');
  } catch {
    return [];
  }
}

// One entry per (area, day) — flagging the same area repeatedly in one session, or
// revisiting it later the same day, doesn't inflate the count.
export function logPainOccurrences(profileId: ProfileId, areas: PainArea[]): void {
  if (areas.length === 0) return;
  const today = todayISO();
  const existing = readPainHistory(profileId);
  const seen = new Set(existing.map((o) => `${o.area}|${o.date}`));
  const additions = areas
    .filter((area) => !seen.has(`${area}|${today}`))
    .map((area) => ({ area, date: today }));
  if (additions.length === 0) return;
  try {
    localStorage.setItem(profileKey(profileId, 'pain_history'), JSON.stringify([...existing, ...additions]));
  } catch {}
}

export interface PainAreaSummary {
  area: PainArea;
  count: number;
  lastDate: string;
}

// Counts occurrences within the trailing window (default 30 days), most-flagged first.
export function summarizePainHistory(history: PainOccurrence[], windowDays = 30): PainAreaSummary[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffMs = cutoff.getTime();

  const byArea = new Map<PainArea, { count: number; lastDate: string }>();
  for (const o of history) {
    if (new Date(o.date).getTime() < cutoffMs) continue;
    const entry = byArea.get(o.area) ?? { count: 0, lastDate: o.date };
    entry.count += 1;
    if (o.date > entry.lastDate) entry.lastDate = o.date;
    byArea.set(o.area, entry);
  }

  return Array.from(byArea.entries())
    .map(([area, v]) => ({ area, count: v.count, lastDate: v.lastDate }))
    .sort((a, b) => b.count - a.count);
}
