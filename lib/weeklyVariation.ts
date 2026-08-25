import { EXERCISE_LIBRARY, EXERCISE_VARIANTS, type ExerciseInfo } from '@/data/workoutData';

const EXERCISE_BY_NAME: Record<string, ExerciseInfo> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.name, e])
);

// Rotates a handful of workhorse exercises through same-pattern variants across the
// 4 weeks of a phase, so a month doesn't repeat the exact same movement. weekInPhase 1
// always shows the original program exercise; later weeks cycle through its variants
// (looping back if there are fewer variants than weeks).
export function applyWeeklyVariation(exercises: ExerciseInfo[], weekInPhase: number): ExerciseInfo[] {
  return exercises.map((exercise) => {
    const variants = EXERCISE_VARIANTS[exercise.name];
    if (!variants || variants.length === 0) return exercise;
    const cycleLength = variants.length + 1; // slot 0 = original
    const slot = (weekInPhase - 1) % cycleLength;
    if (slot === 0) return exercise;
    return EXERCISE_BY_NAME[variants[slot - 1]] ?? exercise;
  });
}

// Week 4 of every phase is a deload: one fewer set per exercise (minimum 2) to shed
// accumulated fatigue before the next phase, without changing weight or exercise choice.
export function applyDeload<T extends { exercise: ExerciseInfo }>(items: T[], weekInPhase: number): T[] {
  if (weekInPhase !== 4) return items;
  return items.map((item) => ({
    ...item,
    exercise: { ...item.exercise, sets: Math.max(2, item.exercise.sets - 1) },
  }));
}

export function isDeloadWeek(weekInPhase: number): boolean {
  return weekInPhase === 4;
}
