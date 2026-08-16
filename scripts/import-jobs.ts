import { createClient } from "@supabase/supabase-js";
import { importJobs } from "../src/lib/jobs/importer";
import { RemotiveProvider } from "../src/lib/jobs/providers/remotive";
import { JobImportRepository } from "../src/lib/jobs/repository.server";
import type { Database } from "../src/lib/supabase/database.types";

process.loadEnvFile?.();

const args = new Set(process.argv.slice(2));
const provider = new RemotiveProvider();

if (args.has("--dry-run")) {
  const result = await provider.fetchJobs();
  console.log(JSON.stringify({ source: provider.source.key, jobs: result.jobs.length, complete: result.complete, warnings: result.warnings }, null, 2));
  process.exit(result.complete ? 0 : 2);
}

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY before running a live import.");

const client = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const summary = await importJobs(provider, new JobImportRepository(client));
console.log(JSON.stringify(summary, null, 2));
