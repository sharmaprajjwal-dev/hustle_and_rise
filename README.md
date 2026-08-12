# Hustle & Rise

Hustle & Rise is becoming a practical career and earning hub for students, job seekers, and early-career people. Its focus is New Zealand jobs and useful remote opportunities, supported by original interview, career, training, side-hustle, and tools content.

Core promise: **Find Work. Build Skills. Earn More.**

## Current status

- ✅ Live: responsive Astro website and shared Hustle & Rise design system
- ✅ Live: modern warm-light UI, responsive motion, and original career-focused hero artwork
- ✅ Live: Jobs, Interview Prep, Career, Training, Side Hustles, and Tools hub pages
- ✅ Live: Markdown article publishing, article pages, RSS, sitemap, and legal pages
- 🚧 Partially implemented: editorial library currently contains legacy digital-income articles
- ✅ Ready: versioned Supabase jobs schema, Row Level Security, typed clients, and environment contract
- 📝 Planned: validated job feeds, filters, job detail pages, structured data, and monetisation components
- 📝 Planned for later: saved jobs, email newsletter, accounts, alerts, and interactive calculators

The Jobs hub currently explains what is coming; it does not display fake listings. The database foundation is versioned in the repository, but no remote Supabase project or external job API is connected yet.

## How it works

```text
Markdown articles ──▶ Astro content collections ──▶ Static article pages

Site configuration ─▶ Astro layouts/components ───▶ Static website

Job API/feed ────────▶ Importer ─▶ Supabase ──────▶ Jobs pages (planned)
```

Astro builds pages ahead of time, which keeps the current site fast and simple. Tailwind provides layout utilities, while shared brand rules live in the global stylesheet.

## Project map

```text
public/                 Public files such as the favicon and robots.txt
src/components/        Reusable page sections and small UI components
src/config/            Owner-editable site navigation and product configuration
src/content/blog/      Markdown articles
src/lib/supabase/      Typed public and trusted-server Supabase clients
src/layouts/           Shared page and article layouts
src/pages/             Website routes
src/styles/            Global design tokens and component styles
supabase/              Local configuration and versioned database migrations
docs/                  Architecture notes and development history
```

## Run the site locally

You need Node.js 22.12 or newer and npm. If you use `nvm`, run `nvm use` to select the version recorded in `.nvmrc`.

```bash
npm install
npm run dev
```

Open the local address Astro prints in the terminal. Before committing a change, run:

```bash
npm run check
npm run build
```

## Common edits

### Change navigation or the brand description

Edit `src/config/site.ts`. The same navigation data is used by the header, footer, and homepage modules.

### Change homepage content

Edit `src/pages/index.astro`. Reusable brand styles are in `src/styles/global.css`.

### Add an article

1. Copy an existing file in `src/content/blog/`.
2. Give the new file a short lowercase filename using hyphens.
3. Update its frontmatter—the metadata between the opening `---` lines.
4. Write the article below the frontmatter using Markdown.
5. Run `npm run build` to validate it.

The allowed article categories are currently defined in `src/content.config.ts`. The content model will be expanded during the editorial checkpoint.

### Add a homepage section

Add the new semantic `<section>` to `src/pages/index.astro`. Reuse the existing `max-w-7xl`, spacing, border, and colour conventions so it remains visually consistent.

### Change colours or fonts

Edit the `@theme` block near the top of `src/styles/global.css`. Changing a token there updates the shared design language across the site.

### Add a job category or provider

The jobs database model is implemented, but no provider is connected. Do not add production listings directly to page files. Checkpoint 3 will add the provider interface, validation, normalisation, and import process.

## Environment variables

No environment variables are required to build the current placeholder site. Copy `.env.example` to `.env` when connecting a Supabase project. Never commit a real `.env` file or put secret keys in variables beginning with `PUBLIC_`.

Preferred Supabase configuration uses:

```text
PUBLIC_SUPABASE_URL                 Browser-safe project URL
PUBLIC_SUPABASE_PUBLISHABLE_KEY     Browser-safe publishable key
SUPABASE_SECRET_KEY                 Server/import-only secret
```

Legacy anon and service-role aliases are supported during migration. See `docs/database.md` for setup and security rules.

## Local database

Docker Desktop is required for Supabase's local stack.

```bash
npm run db:start
npm run db:reset
npm run db:lint
```

`db:reset` recreates only the local development database and reapplies every migration. It does not populate fake job listings.

## Deployment

The repository currently has no confirmed deployment adapter or platform configuration. Confirm the production host before adding scheduled job imports. The site is currently emitted as static files in `dist/` when `npm run build` runs.

## Safe editing guide

- 🟢 Usually safe: Markdown articles, text in page files, navigation labels, and design tokens.
- 🟡 Edit carefully: layouts, the content schema, sitemap, and shared components.
- 🔴 Understand first: environment variables, Supabase clients, database migrations, importers, RLS security policies, and deployment scheduling.

## Development checkpoints

See `docs/CHANGELOG.md` for completed work, `docs/architecture.md` for the current technical shape, and `docs/database.md` for Supabase setup. Documentation must describe what actually works; planned functionality is always labelled as planned.

## Framework baseline

The project runs on Astro 7 and its Content Layer API. Keep Node.js at 22.12 or newer, run `npm audit` after dependency updates, and test generated article URLs whenever the collection loader changes.
