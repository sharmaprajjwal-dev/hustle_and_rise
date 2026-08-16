# Hustle & Rise

Hustle & Rise is becoming a practical career and earning hub for students, job seekers, and early-career people. Its focus is New Zealand jobs and useful remote opportunities, supported by original interview, career, training, side-hustle, and tools content.

Core promise: **Find Work. Build Skills. Earn More.**

## Current status

- ✅ Live: responsive Astro website and shared Hustle & Rise design system
- ✅ Live: modern warm-light UI, responsive motion, and original career-focused hero artwork
- ✅ Live: Jobs, Interview Prep, Career, Training, Side Hustles, and Tools hub pages
- ✅ Live: sectioned editorial publishing, related guides, training classes, RSS, sitemap, and legal pages
- ✅ Live: validated Remotive imports, job filters, detail pages, structured data, and source attribution
- ✅ Ready: versioned Supabase jobs schema, Row Level Security, typed clients, and environment contract
- ✅ Ready: SEO/accessibility audit, inactive-by-default ad slots, product CTAs, analytics hooks, and Search Console verification support
- 📝 Planned: production hosting, scheduled imports, real ad/product account configuration, and an analytics provider
- 📝 Planned for later: saved jobs, email newsletter, accounts, alerts, and interactive calculators

Local development can import approved Remotive listings into Supabase. A remote Supabase project and production schedule are not connected yet.

## How it works

```text
Markdown content ───▶ Astro content collections ──▶ Articles and class pages

Site configuration ─▶ Astro layouts/components ───▶ Static website

Remotive API ────────▶ Importer ─▶ Supabase ──────▶ Jobs pages
```

Astro builds pages ahead of time, which keeps the current site fast and simple. Tailwind provides layout utilities, while shared brand rules live in the global stylesheet.

## Project map

```text
public/                 Public files such as the favicon and robots.txt
src/components/        Reusable page sections and small UI components
src/config/            Owner-editable site navigation and product configuration
src/content/blog/      Markdown articles
src/content/training/  Markdown class plans
src/lib/content/       Editorial relationships and section configuration
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
npm run audit:site
```

The site audit checks generated pages for unique titles and canonicals, metadata, one primary heading, landmarks, image alternatives, safe external links, valid structured data, and 404 indexing protection.

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

Set `section` to `interview`, `career`, `side-hustles`, `money`, or `tools`. Use `relatedJobCategories` for exact job-category relationships and `relatedPosts` for explicit article IDs. Set `draft: true` to keep an article out of the site without deleting it.

### Add or edit a training class

1. Copy `src/content/training/photoshop-20-day-class.md` and rename it with a short hyphenated filename.
2. Edit the title, duration, level, delivery mode, category, schedule, price, instructor, and enrolment link in frontmatter.
3. Edit the Markdown syllabus, projects, and FAQ-style guidance below the frontmatter.
4. Use `status: planned`, `upcoming`, `active`, or `closed`. Use `draft: true` to remove it from navigation and listing pages without deleting it.
5. Set `featured: true` for classes that should receive priority in the catalogue.
6. Run `npm run check` and `npm run build` before publishing.

The Photoshop file is an editable planned-class example. Change its schedule, price, instructor, and enrolment status only when those details are confirmed.

### Add a homepage section

Add the new semantic `<section>` to `src/pages/index.astro`. Reuse the existing `max-w-7xl`, spacing, border, and colour conventions so it remains visually consistent.

### Change colours or fonts

Edit the `@theme` block near the top of `src/styles/global.css`. Changing a token there updates the shared design language across the site.

### Add a job provider

Do not add production listings directly to page files. Follow `docs/job-imports.md`; each provider must have verified terms, validation, normalisation, attribution, and failure-safe lifecycle handling.

## Environment variables

Copy `.env.example` to `.env` when connecting Supabase. Without public values, the build shows an honest jobs empty state. Never commit a real `.env` file or put secret keys in variables beginning with `PUBLIC_`.

Preferred Supabase configuration uses:

```text
PUBLIC_SUPABASE_URL                 Browser-safe project URL
PUBLIC_SUPABASE_PUBLISHABLE_KEY     Browser-safe publishable key
SUPABASE_SECRET_KEY                 Server/import-only secret
```

Legacy anon and service-role aliases are supported during migration. See `docs/database.md` for setup and security rules.

Optional monetisation values are documented in `docs/monetization.md`. Ads, products, analytics providers, and Search Console verification are not active in the repository by default. Never invent or commit account IDs.

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
