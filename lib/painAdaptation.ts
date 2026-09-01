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
  // Absent/'unknown' = no safe alternative is mapped for this combination yet.
  // 'duplicate' = a safe alternative exists but is already used elsewhere in
  // today's session, so this slot keeps the original instead of repeating it.
  cautionReason?: 'unknown' | 'duplicate';
}

// Swaps an exercise for a pre-mapped safer alternative if it strains one of the
// active pain areas. Keeps the slot (same position, same count) — if no safe
// alternative is known for that combination, the original stays with a caution flag
// instead of being silently dropped. `usedNames`, when given, blocks a swap that
// would duplicate an exercise already claimed elsewhere in the same day (several
// different exercises can share one substitute — e.g. Deadlift and Goblet Squat
// both map knee pain to Glute Bridge) — that duplicate slot falls back to the same
// caution-flag treatment as "no known alternative" rather than repeating a name.
export function adaptExerciseForPain(
  exercise: ExerciseInfo,
  activePainAreas: PainArea[],
  usedNames?: Set<string>
): AdaptedExercise {
  if (activePainAreas.length === 0) return { exercise };

  const strains = EXERCISE_STRAIN_AREAS[exercise.name];
  const matchedArea = strains?.find((a) => activePainAreas.includes(a));
  if (!matchedArea) return { exercise };

  const altName = SAFE_ALTERNATIVE[exercise.name]?.[matchedArea];
  const alt = altName ? EXERCISE_BY_NAME[altName] : undefined;
  if (!alt) return { exercise, caution: matchedArea, cautionReason: 'unknown' };
  if (usedNames?.has(alt.name)) return { exercise, caution: matchedArea, cautionReason: 'duplicate' };

  return { exercise: alt, swappedFor: matchedArea, original: exercise };
}

export function adaptExercisesForPain(exercises: ExerciseInfo[], activePainAreas: PainArea[]): AdaptedExercise[] {
  const usedNames = new Set(exercises.map((e) => e.name));
  const results: AdaptedExercise[] = [];
  for (const exercise of exercises) {
    const adapted = adaptExerciseForPain(exercise, activePainAreas, usedNames);
    if (adapted.swappedFor) {
      usedNames.delete(exercise.name);
      usedNames.add(adapted.exercise.name);
    }
    results.push(adapted);
  }
  return results;
}
