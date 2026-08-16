# Job imports

The first adapter uses the Remotive public API. Its public terms were reviewed on 2026-08-12: link every listing to the Remotive URL, name Remotive as the source, do not gate listings behind signup, do not syndicate them to third-party job platforms, and poll no more than four times daily. The importer stores plain text rather than provider HTML.

- Terms/API: https://github.com/remotive-io/remote-jobs-api
- Dry run (no database write): `npm run jobs:import:dry`
- Live run: set `PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY`, then run `npm run jobs:import`

Imports are idempotent on `(source, external_job_id)`. Missing jobs become inactive only after a complete, non-empty response and a 48-hour grace period. Partial or failed responses never deactivate missing jobs. Expired jobs are marked inactive, not deleted. A database index blocks concurrent imports for the same source.

`.github/workflows/sync-jobs.yml` runs the importer twice daily against the production Supabase project, then triggers a Vercel rebuild when `VERCEL_DEPLOY_HOOK_URL` is configured. Its repository secrets are `PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and the optional deploy-hook URL. Manual runs count as additional provider requests; Remotive should never be polled more than four times per day.
