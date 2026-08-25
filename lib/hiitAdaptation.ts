import type { PainArea } from '@/data/workoutData';

export interface HiitMoveAdapted {
  name: string;
  swappedFor?: PainArea;
  original?: string;
}

// HIIT moves are plain labels (not full ExerciseInfo, no sets/reps), so they get their
// own small swap map rather than reusing EXERCISE_STRAIN_AREAS/SAFE_ALTERNATIVE. All
// three moves used across the program's HIIT days are jump/sprint based — genuinely
// knee-loading — so knee is the only area mapped here.
const HIIT_MOVE_ALTERNATIVE: Partial<Record<string, Partial<Record<PainArea, string>>>> = {
  'Sprints':     { knee: 'Shadow Boxing' },
  'Burpees':     { knee: 'Plank Shoulder Taps' },
  'Jump Squats': { knee: 'Bodyweight Squats (no jump)' },
};

export function adaptHiitExercises(exercises: string[], activePainAreas: PainArea[]): HiitMoveAdapted[] {
  return exercises.map((name) => {
    const matchedArea = activePainAreas.find((a) => HIIT_MOVE_ALTERNATIVE[name]?.[a]);
    const alt = matchedArea ? HIIT_MOVE_ALTERNATIVE[name]?.[matchedArea] : undefined;
    if (!matchedArea || !alt) return { name };
    return { name: alt, swappedFor: matchedArea, original: name };
  });
}
