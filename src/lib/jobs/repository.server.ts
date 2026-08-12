import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, JobInsert } from "../supabase/database.types";
import { createJobSlug } from "./normalize";
import type { JobSourceDefinition, NormalizedJob } from "./types";

type Client = SupabaseClient<Database>;
const BATCH_SIZE = 200;

function batches<T>(items: T[]): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += BATCH_SIZE) result.push(items.slice(index, index + BATCH_SIZE));
  return result;
}

export class JobImportRepository {
  constructor(private readonly client: Client) {}

  async ensureSource(source: JobSourceDefinition): Promise<void> {
    const { error } = await this.client.from("job_sources").upsert(
      {
        key: source.key,
        name: source.name,
        api_name: source.apiName,
        base_url: source.baseUrl,
        attribution_text: source.attributionText,
        active: true,
      },
      { onConflict: "key" },
    );
    if (error) throw error;
  }

  async startRun(source: string, startedAt: string): Promise<string> {
    const { data, error } = await this.client
      .from("job_import_runs")
      .insert({ source, started_at: startedAt, status: "running" })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  async upsertJobs(jobs: NormalizedJob[], seenAt: string): Promise<{ inserted: number; updated: number }> {
    if (jobs.length === 0) return { inserted: 0, updated: 0 };
    const source = jobs[0].source;
    const ids = jobs.map((job) => job.externalJobId);
    const existingIds = new Set<string>();
    for (const idBatch of batches(ids)) {
      const { data, error } = await this.client
        .from("jobs")
        .select("external_job_id")
        .eq("source", source)
        .in("external_job_id", idBatch);
      if (error) throw error;
      for (const row of data) existingIds.add(row.external_job_id);
    }

    const rows: JobInsert[] = jobs.map((job) => ({
      source: job.source,
      external_job_id: job.externalJobId,
      title: job.title,
      slug: createJobSlug(job),
      company: job.company ?? null,
      company_logo_url: job.companyLogoUrl ?? null,
      location: job.location ?? null,
      city: job.city ?? null,
      country: job.country ?? null,
      remote_type: job.remoteType ?? null,
      job_type: job.jobType ?? null,
      category: job.category ?? null,
      salary_min: job.salaryMin ?? null,
      salary_max: job.salaryMax ?? null,
      salary_currency: job.salaryCurrency ?? null,
      salary_period: job.salaryPeriod ?? null,
      description: job.description ?? null,
      description_html: null,
      apply_url: job.applyUrl,
      source_url: job.sourceUrl ?? null,
      published_at: job.publishedAt ?? null,
      expires_at: job.expiresAt ?? null,
      last_seen_at: seenAt,
      is_active: true,
    }));

    for (const rowBatch of batches(rows)) {
      const { error } = await this.client.from("jobs").upsert(rowBatch, { onConflict: "source,external_job_id" });
      if (error) throw error;
    }
    const updated = ids.filter((id) => existingIds.has(id)).length;
    return { inserted: ids.length - updated, updated };
  }

  async deactivateExpired(source: string, now: string): Promise<number> {
    const { data, error } = await this.client
      .from("jobs")
      .update({ is_active: false })
      .eq("source", source)
      .eq("is_active", true)
      .lte("expires_at", now)
      .select("id");
    if (error) throw error;
    return data.length;
  }

  async deactivateStale(source: string, staleBefore: string): Promise<number> {
    const { data, error } = await this.client
      .from("jobs")
      .update({ is_active: false })
      .eq("source", source)
      .eq("is_active", true)
      .lt("last_seen_at", staleBefore)
      .select("id");
    if (error) throw error;
    return data.length;
  }

  async finishRun(
    runId: string,
    values: { received: number; inserted: number; updated: number; deactivated: number; status: "succeeded" | "partial" },
    finishedAt: string,
  ): Promise<void> {
    const { error } = await this.client
      .from("job_import_runs")
      .update({
        jobs_received: values.received,
        jobs_inserted: values.inserted,
        jobs_updated: values.updated,
        jobs_deactivated: values.deactivated,
        status: values.status,
        finished_at: finishedAt,
      })
      .eq("id", runId);
    if (error) throw error;
  }

  async failRun(runId: string, errorMessage: string, finishedAt: string): Promise<void> {
    const { error } = await this.client
      .from("job_import_runs")
      .update({ status: "failed", error_message: errorMessage.slice(0, 2_000), finished_at: finishedAt })
      .eq("id", runId);
    if (error) throw error;
  }

  async markSourceSynced(source: string, syncedAt: string): Promise<void> {
    const { error } = await this.client.from("job_sources").update({ last_sync_at: syncedAt }).eq("key", source);
    if (error) throw error;
  }
}
