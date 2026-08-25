import {
  EXERCISE_LIBRARY,
  EXERCISE_STRAIN_AREAS,
  SAFE_ALTERNATIVE,
  type ExerciseInfo,
  type PainArea,
} from '@/data/workoutData';

const EXERCISE_BY_NAME: Record<string, ExerciseInfo> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.name, e])
);

export interface AdaptedExercise {
  exercise: ExerciseInfo;
  swappedFor?: PainArea;
  original?: ExerciseInfo;
  caution?: PainArea;
}

// Swaps an exercise for a pre-mapped safer alternative if it strains one of the
// active pain areas. Keeps the slot (same position, same count) — if no safe
// alternative is known for that combination, the original stays with a caution flag
// instead of being silently dropped.
export function adaptExerciseForPain(exercise: ExerciseInfo, activePainAreas: PainArea[]): AdaptedExercise {
  if (activePainAreas.length === 0) return { exercise };

  const strains = EXERCISE_STRAIN_AREAS[exercise.name];
  const matchedArea = strains?.find((a) => activePainAreas.includes(a));
  if (!matchedArea) return { exercise };

  const altName = SAFE_ALTERNATIVE[exercise.name]?.[matchedArea];
  const alt = altName ? EXERCISE_BY_NAME[altName] : undefined;
  if (!alt) return { exercise, caution: matchedArea };

  return { exercise: alt, swappedFor: matchedArea, original: exercise };
}

export function adaptExercisesForPain(exercises: ExerciseInfo[], activePainAreas: PainArea[]): AdaptedExercise[] {
  return exercises.map((e) => adaptExerciseForPain(e, activePainAreas));
}
