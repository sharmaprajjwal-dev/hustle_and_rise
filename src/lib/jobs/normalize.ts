import { normalizedJobSchema, type NormalizedJob } from "./types";

const htmlEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] === "#") {
        const radix = code[1]?.toLowerCase() === "x" ? 16 : 10;
        const value = Number.parseInt(code.slice(radix === 16 ? 2 : 1), radix);
        return Number.isFinite(value) ? String.fromCodePoint(value) : entity;
      }
      return htmlEntities[code.toLowerCase()] ?? entity;
    })
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

export function normalizeJob(input: unknown): NormalizedJob {
  return normalizedJobSchema.parse(input);
}

export function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const unique = new Map<string, NormalizedJob>();
  for (const job of jobs) unique.set(`${job.source}:${job.externalJobId}`, job);
  return [...unique.values()];
}

function hash(value: string): string {
  let result = 5381;
  for (const character of value) result = (result * 33) ^ character.charCodeAt(0);
  return (result >>> 0).toString(36);
}

export function createJobSlug(job: Pick<NormalizedJob, "title" | "company" | "source" | "externalJobId">): string {
  const words = `${job.title}-${job.company ?? "job"}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/g, "");
  return `${words || "job"}-${job.source}-${hash(job.externalJobId)}`;
}
