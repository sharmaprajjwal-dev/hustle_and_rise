import { deduplicateJobs } from "./normalize";
import type { ImportSummary, JobProvider, JobSourceDefinition, NormalizedJob } from "./types";

export interface ImportRepository {
  ensureSource(source: JobSourceDefinition): Promise<void>;
  startRun(source: string, startedAt: string): Promise<string>;
  upsertJobs(jobs: NormalizedJob[], seenAt: string): Promise<{ inserted: number; updated: number }>;
  deactivateExpired(source: string, now: string): Promise<number>;
  deactivateStale(source: string, staleBefore: string): Promise<number>;
  finishRun(
    runId: string,
    values: { received: number; inserted: number; updated: number; deactivated: number; status: "succeeded" | "partial" },
    finishedAt: string,
  ): Promise<void>;
  failRun(runId: string, errorMessage: string, finishedAt: string): Promise<void>;
  markSourceSynced(source: string, syncedAt: string): Promise<void>;
}

export async function importJobs(
  provider: JobProvider,
  repository: ImportRepository,
  options: { now?: Date; staleGraceHours?: number; signal?: AbortSignal } = {},
): Promise<ImportSummary> {
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const graceHours = options.staleGraceHours ?? 48;
  await repository.ensureSource(provider.source);
  const runId = await repository.startRun(provider.source.key, timestamp);

  try {
    const result = await provider.fetchJobs({ signal: options.signal });
    if (result.jobs.some((job) => job.source !== provider.source.key)) {
      throw new Error(`Provider ${provider.source.key} returned a job assigned to another source`);
    }
    const jobs = deduplicateJobs(result.jobs);
    const counts = await repository.upsertJobs(jobs, timestamp);
    let deactivated = await repository.deactivateExpired(provider.source.key, timestamp);

    // Never deactivate missing records after an empty or partially invalid response.
    if (result.complete && jobs.length > 0) {
      const staleBefore = new Date(now.getTime() - graceHours * 60 * 60 * 1_000).toISOString();
      deactivated += await repository.deactivateStale(provider.source.key, staleBefore);
    }

    const status = result.complete ? "succeeded" : "partial";
    const summary = {
      source: provider.source.key,
      received: jobs.length,
      inserted: counts.inserted,
      updated: counts.updated,
      deactivated,
      status,
      warnings: result.warnings,
    } satisfies ImportSummary;
    await repository.finishRun(runId, summary, timestamp);
    await repository.markSourceSynced(provider.source.key, timestamp);
    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import failure";
    await repository.failRun(runId, message, timestamp);
    throw error;
  }
}
