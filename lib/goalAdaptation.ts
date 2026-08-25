import { EXERCISE_LIBRARY, type ExerciseInfo } from '@/data/workoutData';
import type { Goal } from '@/app/page';

const EXERCISE_BY_NAME: Record<string, ExerciseInfo> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.name, e])
);

// Fat Loss Focus adds a short metabolic finisher to the end of strength days —
// more work density, without touching the core program's sets/reps/weights so
// progression tracking and swaps keep working exactly as they do today.
const FINISHER_EXERCISE_NAMES = ['Burpees', 'Mountain Climbers'];

export function getFinisherExercises(goal: Goal): ExerciseInfo[] {
  if (goal !== 'fatloss') return [];
  return FINISHER_EXERCISE_NAMES
    .map((name) => EXERCISE_BY_NAME[name])
    .filter((e): e is ExerciseInfo => Boolean(e))
    .map((e) => ({ ...e, sets: 2 }));
}

// "New to training" trims a set off every exercise for a first-timer's first two
// weeks (same mechanism as the phase-4 deload — never below 2 sets), so someone
// who has never trained isn't handed full program volume on day one.
export function applyNewToTraining<T extends { exercise: ExerciseInfo }>(
  items: T[],
  phase: 1 | 2 | 3,
  weekInPhase: number,
  enabled: boolean
): T[] {
  if (!enabled || phase !== 1 || weekInPhase > 2) return items;
  return items.map((item) => ({
    ...item,
    exercise: { ...item.exercise, sets: Math.max(2, item.exercise.sets - 1) },
  }));
}
