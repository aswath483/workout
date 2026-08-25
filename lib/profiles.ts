export const PROFILES = [
  { id: 'aswath', label: 'Aswath' },
  { id: 'surekaa', label: 'Surekaa' },
] as const;

export type ProfileId = (typeof PROFILES)[number]['id'];

export function isProfileId(value: string | null): value is ProfileId {
  return PROFILES.some((p) => p.id === value);
}

export function profileLabel(id: ProfileId): string {
  return PROFILES.find((p) => p.id === id)!.label;
}

// Every localStorage key for a profile's data is namespaced under this prefix, e.g.
// "wk_aswath_checked". lib/cloudSync.ts syncs exactly the keys under this prefix for
// whichever profile is active, so new state just needs to use this helper to be synced.
export function profileKeyPrefix(id: ProfileId): string {
  return `wk_${id}_`;
}

export function profileKey(id: ProfileId, key: string): string {
  return `${profileKeyPrefix(id)}${key}`;
}
