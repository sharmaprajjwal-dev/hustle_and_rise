import assert from "node:assert/strict";
import test from "node:test";
import { readSavedJobs, SAVED_JOBS_STORAGE_KEY, writeSavedJobs } from "../src/lib/saved-jobs";

function createStorage(initial?: string): Storage {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(SAVED_JOBS_STORAGE_KEY, initial);
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

test("saved jobs recover safely from invalid browser data", () => {
  assert.deepEqual(readSavedJobs(createStorage("not-json")), []);
  assert.deepEqual(readSavedJobs(createStorage('{"unexpected":true}')), []);
});

test("saved jobs retain unique non-empty slugs", () => {
  const storage = createStorage();
  assert.deepEqual(writeSavedJobs(["design-role", "design-role", "", "support-role"], storage), ["design-role", "support-role"]);
  assert.deepEqual(readSavedJobs(storage), ["design-role", "support-role"]);
});
