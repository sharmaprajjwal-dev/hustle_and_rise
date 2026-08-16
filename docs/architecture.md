# Current architecture

## Today

Hustle & Rise is a static Astro 7 website. Astro's Content Layer validates Markdown article metadata and generates article routes during the build. The shared layout owns metadata, navigation, footer content, and the small mobile-menu script.

The site deliberately has no client framework. JavaScript is limited to interactions that require it.

The Supabase schema, typed clients, Remotive importer, and jobs frontend are versioned, but the site is not linked to a remote Supabase project. Production environment values and the deployment schedule still need to be configured once hosting is chosen.

## Source of truth

- `src/config/site.ts`: brand details, primary navigation, and product modules
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

## Rendering decision

Editorial pages and stable hubs remain static. The jobs rendering approach will be selected after the production hosting target and update-frequency requirements are confirmed.
