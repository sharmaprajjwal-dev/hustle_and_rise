import assert from "node:assert/strict";
import test from "node:test";
import { importJobs, type ImportRepository } from "../src/lib/jobs/importer";
import { createJobSlug, deduplicateJobs, htmlToPlainText, normalizeJob } from "../src/lib/jobs/normalize";
import { RemotiveProvider } from "../src/lib/jobs/providers/remotive";
import type { JobProvider, NormalizedJob } from "../src/lib/jobs/types";

const job: NormalizedJob = normalizeJob({
  source: "test",
  externalJobId: "42",
  title: "Product Designer",
  company: "Example Ltd",
  applyUrl: "https://example.test/jobs/42",
});

test("plain-text conversion removes executable markup and decodes entities", () => {
  assert.equal(htmlToPlainText("<p>Hello &amp; welcome</p><script>alert(1)</script>"), "Hello & welcome");
});

test("normalization rejects unsafe apply URLs", () => {
  assert.throws(() => normalizeJob({ ...job, applyUrl: "javascript:alert(1)" }));
});

test("deduplication is stable and slugs are deterministic", () => {
  assert.equal(deduplicateJobs([job, { ...job, title: "Updated title" }])[0].title, "Updated title");
  assert.equal(createJobSlug(job), createJobSlug(job));
  assert.match(createJobSlug(job), /^product-designer-example-ltd-test-/);
});

test("Remotive adapter validates and normalizes without retaining HTML", async () => {
  const response = {
    jobs: [
      {
        id: 123,
        url: "https://remotive.com/remote-jobs/design/example-123",
        title: "Remote Designer",
        company_name: "Example",
        company_logo: "https://example.test/logo.png",
        category: "Design",
        job_type: "full_time",
        publication_date: "2026-08-12T01:00:00Z",
        candidate_required_location: "Worldwide",
        description: "<p>Build <strong>useful</strong> products.</p>",
      },
    ],
  };
  const fetcher: typeof fetch = async () => new Response(JSON.stringify(response), { status: 200 });
  const result = await new RemotiveProvider(fetcher).fetchJobs();

  assert.equal(result.complete, true);
  assert.equal(result.jobs[0].description, "Build useful products.");
  assert.equal(result.jobs[0].jobType, "full-time");
});

class MemoryRepository implements ImportRepository {
  calls: string[] = [];
  async ensureSource() { this.calls.push("source"); }
  async startRun() { this.calls.push("start"); return "run-1"; }
  async upsertJobs(jobs: NormalizedJob[]) { this.calls.push(`upsert:${jobs.length}`); return { inserted: jobs.length, updated: 0 }; }
  async deactivateExpired() { this.calls.push("expired"); return 1; }
  async deactivateStale() { this.calls.push("stale"); return 2; }
  async finishRun() { this.calls.push("finish"); }
  async failRun() { this.calls.push("fail"); }
  async markSourceSynced() { this.calls.push("synced"); }
}

function provider(result: Awaited<ReturnType<JobProvider["fetchJobs"]>>): JobProvider {
  return {
    source: { key: "test", name: "Test", apiName: "Fixture", baseUrl: "https://example.test", attributionText: "Test source" },
    async fetchJobs() { return result; },
  };
}

test("complete imports deduplicate and safely deactivate stale jobs", async () => {
  const repository = new MemoryRepository();
  const summary = await importJobs(provider({ jobs: [job, job], complete: true, warnings: [] }), repository, {
    now: new Date("2026-08-12T02:00:00Z"),
  });
  assert.deepEqual(repository.calls, ["source", "start", "upsert:1", "expired", "stale", "finish", "synced"]);
  assert.equal(summary.deactivated, 3);
});

test("partial and empty imports cannot deactivate missing jobs", async () => {
  for (const result of [
    { jobs: [job], complete: false, warnings: ["bad row"] },
    { jobs: [], complete: true, warnings: [] },
  ]) {
    const repository = new MemoryRepository();
    await importJobs(provider(result), repository);
    assert.equal(repository.calls.includes("stale"), false);
  }
});

test("provider failures are audited and do not mutate jobs", async () => {
  const repository = new MemoryRepository();
  const failing = provider({ jobs: [], complete: true, warnings: [] });
  failing.fetchJobs = async () => { throw new Error("provider unavailable"); };
  await assert.rejects(() => importJobs(failing, repository), /provider unavailable/);
  assert.deepEqual(repository.calls, ["source", "start", "fail"]);
});

test("provider source mismatches fail before any job mutation", async () => {
  const repository = new MemoryRepository();
  await assert.rejects(
    () => importJobs(provider({ jobs: [{ ...job, source: "unexpected" }], complete: true, warnings: [] }), repository),
    /another source/,
  );
  assert.deepEqual(repository.calls, ["source", "start", "fail"]);
});
