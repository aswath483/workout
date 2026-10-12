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
  const firstAlt = altName ? EXERCISE_BY_NAME[altName] : undefined;
  if (!firstAlt) return { exercise, caution: true };
  let alt: ExerciseInfo = firstAlt;

  // An alternative can itself need gear (Band-Assisted Pull-Up → Negative Pull-Up still
  // needs the bar), so follow the chain while there's a further fallback to try.
  for (let hops = 0; hops < 3 && !canDoExercise(alt.name, owned); hops++) {
    const nextName: string | undefined = EQUIPMENT_ALTERNATIVE[alt.name];
    const next: ExerciseInfo | undefined = nextName ? EXERCISE_BY_NAME[nextName] : undefined;
    if (!next) break;
    alt = next;
  }

  return { exercise: alt, swapped: true, original: exercise };
}

export function adaptExercisesForEquipment(exercises: ExerciseInfo[], owned: EquipmentItem[]): EquipmentAdapted[] {
  return exercises.map((e) => adaptExerciseForEquipment(e, owned));
}
