# Monetisation and measurement

## Current state

Nothing in this repository earns money or sends analytics data by default.

- **Google AdSense:** prepared, not configured. The shared loader and two labelled slots remain absent when their environment values are blank.
- **Adsterra:** not configured. The slot boundary is reusable, but a reviewed provider adapter is still required.
- **Digital products:** prepared, not configured. Two article-specific CTA positions remain absent until their checkout URLs are supplied.
- **Analytics:** event hooks prepared, no analytics provider connected. Hooks emit `hustle:analytics` in the browser and push to an existing `dataLayer`; they create no network requests themselves.
- **Search Console:** verification-meta support prepared, not configured.

## Preview placements safely

Set `PUBLIC_ADS_PREVIEW=true` or `PUBLIC_PRODUCTS_PREVIEW=true` in the local `.env`, then restart the development server. Preview cards are clearly labelled and never contact an ad or checkout provider.

The current ad placements are:

- `JobListAdSlot.astro`: between the jobs grid and its pagination control.
- `ArticleAdSlot.astro`: after article content and any relevant product CTA.

Ads are deliberately outside job cards and application controls. To move a slot, move its wrapper component as one unit. To add a placement, add its key to `AdPlacement`, configure a dedicated environment slot ID, then render `AdSlot` in a visually separate location.

## Enable AdSense

After the domain, consent approach, privacy wording, and AdSense account are approved, set:

```text
PUBLIC_AD_PROVIDER=adsense
PUBLIC_AD_CLIENT_ID=ca-pub-...
PUBLIC_AD_JOB_LIST_SLOT_ID=...
PUBLIC_AD_ARTICLE_SLOT_ID=...
```

Use one slot ID per placement. Never commit account or slot IDs. Set `PUBLIC_AD_PROVIDER=none` to disable all live ads without removing components. Review every placement against current AdSense programme and placement policies before launch. Do not label ads as job actions or encourage clicks.

## Enable products

Create and verify the relevant checkout pages, then set one or both URLs:

```text
PUBLIC_INTERVIEW_WORKBOOK_URL=https://...
PUBLIC_JOB_TRACKER_URL=https://...
```

Each CTA is selected by article frontmatter (`product`) and is not injected into unrelated content. If a URL is affiliate rather than owned-product commerce, add an adjacent disclosure and `sponsored` to the link relationship before publishing.

## Connect measurement

Interactive elements use `data-analytics-event` attributes. Current event names are `job_apply_click`, `job_filter_used`, `product_click`, and `contact_email_click`. A future analytics adapter can listen for `hustle:analytics` events or initialise a compatible `dataLayer`. Filter events include the field name but not the visitor's search text.

Update the privacy page and implement any required consent controls before connecting a service that stores identifiers, uses cookies, or sends visitor data externally.
