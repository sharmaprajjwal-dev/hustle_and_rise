import { getCollection } from "astro:content";
import { site } from "../config/site";
import { getActiveJobs } from "../lib/jobs/queries.server";

type SitemapEntry = { path: string; lastmod?: Date | string | null };

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
})[character] ?? character);

export async function GET() {
  const [posts, courses, jobs] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getCollection("training", ({ data }) => !data.draft),
    getActiveJobs(),
  ]);

  const entries: SitemapEntry[] = [
    "", "about", "blog", "career", "contact", "disclaimer", "affiliate-disclosure", "interview", "jobs", "privacy", "side-hustles", "terms", "tools", "training",
  ].map((path) => ({ path }));

  entries.push(
    ...posts.map((post) => ({ path: `blog/${post.id}`, lastmod: post.data.updatedDate ?? post.data.pubDate })),
    ...courses.map((course) => ({ path: `training/${course.id}` })),
    ...jobs.filter((job) => job.slug).map((job) => ({ path: `jobs/${job.slug}`, lastmod: job.updated_at })),
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ path, lastmod }) => {
  const url = new URL(path ? `/${path}/` : "/", site.domain).toString();
  const modified = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "";
  return `  <url>\n    <loc>${escapeXml(url)}</loc>${modified}\n  </url>`;
}).join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
