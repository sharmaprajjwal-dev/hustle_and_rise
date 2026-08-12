# Current architecture

## Today

Hustle & Rise is a static Astro 4 website. Astro Content Collections validate Markdown article metadata and generate article routes during the build. The shared layout owns metadata, navigation, footer content, and the small mobile-menu script.

The site deliberately has no client framework. JavaScript is limited to interactions that require it.

## Source of truth

- `src/config/site.ts`: brand details, primary navigation, and product modules
- `src/styles/global.css`: colours, fonts, and reusable visual rules
- `src/content/config.ts`: current Markdown article schema
- `src/content/blog/`: current article content
- `src/layouts/BaseLayout.astro`: shared document structure

## Planned jobs architecture

```text
Permitted job API or feed
          │
          ▼
Provider adapter ─▶ validation ─▶ normalisation
                                      │
                                      ▼
                         Supabase jobs database
                                      │
                                      ▼
                         Astro jobs pages and feeds
```

Provider failures must not delete existing jobs. Imports will upsert on `(source, external_job_id)`, record import outcomes, and expire unseen listings deliberately.

## Rendering decision

Editorial pages and stable hubs remain static. The jobs rendering approach will be selected after the production hosting target and update-frequency requirements are confirmed.
