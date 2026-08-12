import { z } from "zod";
import { htmlToPlainText, normalizeJob } from "../normalize";
import type { JobProvider, ProviderFetchResult } from "../types";

const API_URL = "https://remotive.com/api/remote-jobs";

const responseSchema = z.object({
  jobs: z.array(z.unknown()),
});

const jobSchema = z.object({
  id: z.union([z.number(), z.string()]),
  url: z.string(),
  title: z.string(),
  company_name: z.string().optional().nullable(),
  company_logo: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  job_type: z.string().optional().nullable(),
  publication_date: z.string().optional().nullable(),
  candidate_required_location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

function optional(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export class RemotiveProvider implements JobProvider {
  readonly source = {
    key: "remotive",
    name: "Remotive",
    apiName: "Remotive Public Jobs API",
    baseUrl: "https://remotive.com",
    attributionText: "Jobs sourced from Remotive",
  } as const;

  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async fetchJobs(options: { signal?: AbortSignal } = {}): Promise<ProviderFetchResult> {
    const response = await this.fetcher(API_URL, {
      headers: { Accept: "application/json", "User-Agent": "HustleAndRise/1.0" },
      signal: options.signal,
    });
    if (!response.ok) throw new Error(`Remotive API returned HTTP ${response.status}`);

    const payload = responseSchema.parse(await response.json());
    const jobs = [];
    const warnings: string[] = [];

    for (const [index, raw] of payload.jobs.entries()) {
      const parsed = jobSchema.safeParse(raw);
      if (!parsed.success) {
        warnings.push(`Skipped invalid Remotive job at index ${index}`);
        continue;
      }

      const item = parsed.data;
      try {
        jobs.push(
          normalizeJob({
            source: this.source.key,
            externalJobId: String(item.id),
            title: item.title,
            company: optional(item.company_name),
            companyLogoUrl: optional(item.company_logo),
            location: optional(item.candidate_required_location),
            remoteType: "remote",
            jobType: optional(item.job_type)?.replaceAll("_", "-"),
            category: optional(item.category),
            description: item.description ? htmlToPlainText(item.description) : undefined,
            applyUrl: item.url,
            sourceUrl: item.url,
            publishedAt: item.publication_date ? new Date(item.publication_date).toISOString() : undefined,
          }),
        );
      } catch {
        warnings.push(`Skipped invalid Remotive job ${String(item.id)}`);
      }
    }

    return { jobs, complete: warnings.length === 0, warnings };
  }
}
