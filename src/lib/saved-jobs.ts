export const SAVED_JOBS_STORAGE_KEY = "hustle-rise:saved-jobs:v1";

export function readSavedJobs(storage: Storage = window.localStorage): string[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(SAVED_JOBS_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))] : [];
  } catch {
    return [];
  }
}

export function writeSavedJobs(slugs: string[], storage: Storage = window.localStorage): string[] {
  const normalized = [...new Set(slugs.filter(Boolean))];
  storage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
