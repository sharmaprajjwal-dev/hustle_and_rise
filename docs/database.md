# Supabase jobs database

Checkpoint 2 provides a reproducible database foundation. It does not link a remote project, import jobs, schedule tasks, or publish demo records.

## Tables

- `job_sources`: approved providers, attribution, activation state, and last successful sync time
- `jobs`: normalized listings with source identity, public fields, lifecycle timestamps, and `(source, external_job_id)` duplicate protection
- `job_import_runs`: internal importer outcomes and counters; never readable through the public client

The public database roles can select only active sources and jobs where `is_active` is true and `expires_at` has not passed. They receive no insert, update, or delete grants. The trusted server key bypasses Row Level Security and must be restricted to import or administration environments.

## Keys and environment variables

Create a local `.env` from `.env.example` and use values from Supabase Project Settings.

```text
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

Supabase's legacy `anon` and `service_role` keys are supported as `PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`, but new projects should prefer publishable and secret keys.

Never:

- prefix the secret key with `PUBLIC_`
- import `admin.server.ts` into browser code
- log API keys or include them in error messages
- use a privileged client for ordinary public reads
- change a remote production schema manually after adopting migrations

## Local workflow

Install Docker Desktop, then run:

```bash
npm install
npm run db:start
npm run db:reset
npm run db:lint
```

`db:reset` destroys and recreates the local database only. The empty seed file deliberately prevents fabricated jobs from appearing in production code paths.

Stop the local services with:

```bash
npm run db:stop
```

## Connecting a remote project

Do this only after choosing the production hosting target and creating separate development and production Supabase projects.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Do not run `db reset --linked` against production. Apply remote changes through committed migration files so local and remote migration histories remain consistent.

## Database types

`src/lib/supabase/database.types.ts` matches the checked-in migration. After applying schema changes, regenerate it from the local database and review the diff:

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

The provider importer added in Checkpoint 3 must use the trusted server client, validate every external response, upsert by `(source, external_job_id)`, record an import run, and deactivate stale jobs only after a source-specific grace period.
