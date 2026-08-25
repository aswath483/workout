import {
  EXERCISE_LIBRARY,
  EQUIPMENT_ALTERNATIVE,
  canDoExercise,
  type ExerciseInfo,
  type EquipmentItem,
} from '@/data/workoutData';

const EXERCISE_BY_NAME: Record<string, ExerciseInfo> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.name, e])
);

export interface EquipmentAdapted {
  exercise: ExerciseInfo;
  swapped?: boolean;
  original?: ExerciseInfo;
  caution?: boolean; // needs gear the profile doesn't own, and no alternative is known
}

// Swaps an exercise for a gear-appropriate alternative if the profile doesn't own what
// it needs. Same slot, same count — if no alternative is known, the original stays with
// a caution flag instead of being silently dropped.
export function adaptExerciseForEquipment(exercise: ExerciseInfo, owned: EquipmentItem[]): EquipmentAdapted {
  if (canDoExercise(exercise.name, owned)) return { exercise };

  const altName = EQUIPMENT_ALTERNATIVE[exercise.name];
  const alt = altName ? EXERCISE_BY_NAME[altName] : undefined;
  if (!alt) return { exercise, caution: true };

  return { exercise: alt, swapped: true, original: exercise };
}

export function adaptExercisesForEquipment(exercises: ExerciseInfo[], owned: EquipmentItem[]): EquipmentAdapted[] {
  return exercises.map((e) => adaptExerciseForEquipment(e, owned));
}
