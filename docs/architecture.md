# Current architecture

## Today

Hustle & Rise is a static Astro 7 website. Astro's Content Layer validates Markdown article metadata and generates article routes during the build. The shared layout owns metadata, navigation, footer content, and the small mobile-menu script.

The site deliberately has no client framework. JavaScript is limited to interactions that require it.

The Supabase schema, typed clients, Remotive importer, and jobs frontend are versioned and linked to a dedicated hosted Supabase project. All current migrations and the inactive Sender.net email Edge Function are deployed. Vercel is the selected static host; its project and environment values still need final configuration.

## Source of truth

- `src/config/site.ts`: brand details, primary navigation, and product modules
- `src/config/monetization.ts`: optional ad placement and digital-product configuration
- `src/styles/global.css`: colours, fonts, and reusable visual rules
- `src/content.config.ts`: Markdown loader and article schema
- `src/content/blog/`: sectioned editorial content
- `src/content/training/`: owner-editable class plans
- `src/lib/content/editorial.ts`: editorial taxonomy and explicit relationship logic
- `src/lib/supabase/public.ts`: optional browser-safe, RLS-limited client
- `src/lib/supabase/admin.server.ts`: trusted import/admin client; never browser-safe
- `src/lib/supabase/database.types.ts`: current checked-in database contract
- `src/lib/jobs/queries.server.ts`: build-time active and historical job queries
- `src/pages/jobs/`: searchable job index and generated job detail pages
- `src/pages/sitemap.xml.ts`: canonical sitemap built from static, editorial, training, and active-job routes
- `scripts/audit-site.mjs`: post-build SEO and accessibility contract checks
- `src/components/AdSlot.astro`: inactive-by-default, provider-swappable ad boundary
- `src/components/AnalyticsHooks.astro`: provider-neutral interaction event bridge
- `src/lib/saved-jobs.ts`: versioned device-local shortlist storage contract
- `src/components/SavedJobsController.astro`: shared save controls, counts, announcements, and cross-tab updates
- `src/layouts/BaseLayout.astro`: shared document structure
- `supabase/migrations/`: reproducible PostgreSQL schema and security policies

## Jobs data architecture

```text
Permitted job API or feed
          │
          ▼
Provider adapter ─▶ validation ─▶ normalisation
                                      │
                                      ▼
                    Supabase jobs database + RLS
                                      │
                                      ▼
                         Astro jobs pages and feeds
```

The database enforces uniqueness on `(source, external_job_id)`, records import outcomes, and exposes only active, unexpired jobs to public clients. Provider failures and partial or empty responses cannot deactivate missing listings. Complete imports use a grace period before marking missing jobs inactive.

## Rendering and refresh decision

Editorial pages, stable hubs, and job routes remain statically generated on Vercel. GitHub Actions imports approved jobs twice daily. A successful import calls a protected Vercel deploy hook so the generated job pages and sitemap refresh from Supabase without committing generated data.

## Monetisation boundary

AdSense, product checkout URLs, Search Console verification, and any future analytics provider are controlled through public environment configuration. With those values blank, no ad or product UI is rendered and no third-party measurement script is loaded. Preview flags render labelled layout placeholders without contacting external providers. See `docs/monetization.md` for the exact operational state and activation checklist.

## Saved jobs

Phase 2 starts with an explicitly device-local shortlist. The browser stores only selected job slugs under a versioned key; it does not send them to Supabase, create an account, or imply cross-device synchronisation. The saved-jobs route is a noindex utility view that filters the currently active build-time job catalogue.

## Email boundary

Sender.net is the selected email provider but remains unconfigured. The transactional “email this job” path uses a Supabase Edge Function with input validation, keyed audit hashes, request limits, short retention, and generic public errors. The form remains absent unless `PUBLIC_EMAIL_JOB_ENABLED` is enabled at build time. The Sender.net API token must never enter browser code or a `PUBLIC_` environment variable. Domain authentication and production secrets remain deployment tasks. Newsletter consent stays separate and is not implemented. See `docs/email.md`.
