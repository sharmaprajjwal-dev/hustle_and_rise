# Current architecture

## Today

Hustle & Rise is a static Astro 7 website. Astro's Content Layer validates Markdown article metadata and generates article routes during the build. The shared layout owns metadata, navigation, footer content, and the small mobile-menu script.

The site deliberately has no client framework. JavaScript is limited to interactions that require it.

The Supabase schema and typed clients are now versioned, but the site is not linked to a remote Supabase project. The public Jobs route remains an honest placeholder until an approved provider and deployment schedule are configured.

## Source of truth

- `src/config/site.ts`: brand details, primary navigation, and product modules
- `src/styles/global.css`: colours, fonts, and reusable visual rules
- `src/content.config.ts`: Markdown loader and article schema
- `src/content/blog/`: current article content
- `src/lib/supabase/public.ts`: optional browser-safe, RLS-limited client
- `src/lib/supabase/admin.server.ts`: trusted import/admin client; never browser-safe
- `src/lib/supabase/database.types.ts`: current checked-in database contract
- `src/layouts/BaseLayout.astro`: shared document structure
- `supabase/migrations/`: reproducible PostgreSQL schema and security policies

## Planned jobs architecture

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

The database enforces uniqueness on `(source, external_job_id)`, records import outcomes, and exposes only active, unexpired jobs to public clients. Provider failures must not delete existing jobs; Checkpoint 3 will implement deliberate stale-listing deactivation.

## Rendering decision

Editorial pages and stable hubs remain static. The jobs rendering approach will be selected after the production hosting target and update-frequency requirements are confirmed.
