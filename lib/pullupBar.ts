import {
  EXERCISE_LIBRARY,
  PULLUP_BAR_PLAN,
  type Day,
  type EquipmentItem,
  type ExerciseInfo,
  type PainArea,
  type PullupBarSlot,
} from '@/data/workoutData';

const EXERCISE_BY_NAME: Record<string, ExerciseInfo> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.name, e])
);

function resolveSlot(slot: PullupBarSlot): ExerciseInfo | undefined {
  const base = EXERCISE_BY_NAME[slot.name];
  return base ? { ...base, ...slot.overrides } : undefined;
}

// Swaps the day's designated accessory for its bar exercise, at the same position —
// e.g. Friday's Barbell Row becomes Inverted Row. Runs before weekly variation so the
// replaced slot doesn't rotate back to a variant of what it replaced.
export function applyPullupBarReplacement(
  exercises: ExerciseInfo[],
  phase: 1 | 2 | 3,
  day: Day,
  owned: EquipmentItem[]
): ExerciseInfo[] {
  if (!owned.includes('pullup_bar')) return exercises;
  const replace = PULLUP_BAR_PLAN[phase][day]?.replace;
  if (!replace) return exercises;
  const to = resolveSlot(replace.to);
  if (!to) return exercises;
  return exercises.map((e) => (e.name === replace.from ? to : e));
}

export interface PullupBarExtras {
  exercises: ExerciseInfo[];
  // The light (Monday) bar work was skipped because a shoulder or elbow pain area is on.
  skippedForPain: boolean;
}

// The day's extra bar exercises, shown as their own section before the main program.
// Light days are dropped outright on a shoulder/elbow pain day rather than swapped —
// they're optional practice, and Wed/Fri already step down to easier versions.
export function getPullupBarExtras(
  phase: 1 | 2 | 3,
  day: Day,
  owned: EquipmentItem[],
  activePainAreas: PainArea[]
): PullupBarExtras {
  const plan = PULLUP_BAR_PLAN[phase][day];
  if (!owned.includes('pullup_bar') || !plan?.extras) return { exercises: [], skippedForPain: false };
  if (plan.light && activePainAreas.some((a) => a === 'shoulder' || a === 'elbow')) {
    return { exercises: [], skippedForPain: true };
  }
  return {
    exercises: plan.extras.map(resolveSlot).filter((e): e is ExerciseInfo => Boolean(e)),
    skippedForPain: false,
  };
}
