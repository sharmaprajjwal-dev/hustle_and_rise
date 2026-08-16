import type { Job } from "../supabase/database.types";
import { getAdminSupabaseClient } from "../supabase/admin.server";
import { getPublicSupabaseClient } from "../supabase/public";

export type ListedJob = Job & {
  sourceName: string;
  sourceAttribution: string | null;
};

type SourceSummary = { key: string; name: string; attribution_text: string | null };

function attachSources(jobs: Job[], sources: SourceSummary[]): ListedJob[] {
  const sourceByKey = new Map(sources.map((source) => [source.key, source]));
  return jobs.map((job) => ({
    ...job,
    sourceName: sourceByKey.get(job.source)?.name ?? job.source,
    sourceAttribution: sourceByKey.get(job.source)?.attribution_text ?? null,
  }));
}

export async function getActiveJobs(): Promise<ListedJob[]> {
  const client = getPublicSupabaseClient();
  if (!client) return [];

  const [{ data: jobs, error: jobsError }, { data: sources, error: sourcesError }] = await Promise.all([
    client.from("jobs").select("*").order("published_at", { ascending: false, nullsFirst: false }),
    client.from("job_sources").select("key,name,attribution_text"),
  ]);

  if (jobsError) throw new Error(`Unable to load jobs: ${jobsError.message}`);
  if (sourcesError) throw new Error(`Unable to load job sources: ${sourcesError.message}`);

  return attachSources(jobs, sources);
}

export async function getJobsForStaticPages(): Promise<ListedJob[]> {
  let client;
  try {
    client = getAdminSupabaseClient();
  } catch {
    return getActiveJobs();
  }

  const [{ data: jobs, error: jobsError }, { data: sources, error: sourcesError }] = await Promise.all([
    client.from("jobs").select("*").order("published_at", { ascending: false, nullsFirst: false }),
    client.from("job_sources").select("key,name,attribution_text"),
  ]);
  if (jobsError) throw new Error(`Unable to load job pages: ${jobsError.message}`);
  if (sourcesError) throw new Error(`Unable to load job sources: ${sourcesError.message}`);
  return attachSources(jobs, sources);
}

export function formatJobType(value: string | null): string | null {
  if (!value) return null;
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatPostedDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-NZ", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatSalary(job: Pick<Job, "salary_min" | "salary_max" | "salary_currency" | "salary_period">): string | null {
  if (job.salary_min === null && job.salary_max === null) return null;
  const currency = job.salary_currency ?? "NZD";
  const number = new Intl.NumberFormat("en-NZ", { style: "currency", currency, maximumFractionDigits: 0 });
  const range = job.salary_min !== null && job.salary_max !== null
    ? `${number.format(job.salary_min)}–${number.format(job.salary_max)}`
    : number.format(job.salary_min ?? job.salary_max ?? 0);
  return job.salary_period ? `${range} / ${job.salary_period}` : range;
}
