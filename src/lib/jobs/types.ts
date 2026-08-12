import { z } from "zod";

const httpUrl = z.url().refine((value) => /^https?:\/\//i.test(value), "Must use HTTP(S)");

export const normalizedJobSchema = z
  .object({
    source: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/),
    externalJobId: z.string().trim().min(1),
    title: z.string().trim().min(1).max(300),
    company: z.string().trim().max(300).optional(),
    companyLogoUrl: httpUrl.optional(),
    location: z.string().trim().max(300).optional(),
    city: z.string().trim().max(120).optional(),
    country: z.string().trim().max(120).optional(),
    remoteType: z.string().trim().max(80).optional(),
    jobType: z.string().trim().max(80).optional(),
    category: z.string().trim().max(160).optional(),
    salaryMin: z.number().nonnegative().optional(),
    salaryMax: z.number().nonnegative().optional(),
    salaryCurrency: z.string().regex(/^[A-Z]{3}$/).optional(),
    salaryPeriod: z.enum(["hour", "day", "week", "month", "year"]).optional(),
    description: z.string().max(100_000).optional(),
    applyUrl: httpUrl,
    sourceUrl: httpUrl.optional(),
    publishedAt: z.iso.datetime({ offset: true }).optional(),
    expiresAt: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(
    (job) => job.salaryMin === undefined || job.salaryMax === undefined || job.salaryMax >= job.salaryMin,
    { message: "salaryMax must be greater than or equal to salaryMin", path: ["salaryMax"] },
  );

export type NormalizedJob = z.infer<typeof normalizedJobSchema>;

export interface JobSourceDefinition {
  key: string;
  name: string;
  apiName: string;
  baseUrl: string;
  attributionText: string;
}

export interface ProviderFetchResult {
  jobs: NormalizedJob[];
  complete: boolean;
  warnings: string[];
}

export interface JobProvider {
  source: JobSourceDefinition;
  fetchJobs(options?: { signal?: AbortSignal }): Promise<ProviderFetchResult>;
}

export interface ImportSummary {
  source: string;
  received: number;
  inserted: number;
  updated: number;
  deactivated: number;
  status: "succeeded" | "partial";
  warnings: string[];
}
