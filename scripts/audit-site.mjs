import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const failures = [];
const titles = new Map();
const canonicals = new Map();

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : path.endsWith(".html") ? [path] : [];
  }));
  return nested.flat();
}

const count = (html, pattern) => [...html.matchAll(pattern)].length;
const content = (html, pattern) => html.match(pattern)?.[1]?.trim();

for (const file of await htmlFiles(root)) {
  const html = await readFile(file, "utf8");
  const name = relative(root, file);
  const title = content(html, /<title>([\s\S]*?)<\/title>/i);
  const canonical = content(html, /<link rel="canonical" href="([^"]+)"/i);

  if (!title) failures.push(`${name}: missing title`);
  if (!content(html, /<meta name="description" content="([^"]+)"/i)) failures.push(`${name}: missing description`);
  if (!canonical) failures.push(`${name}: missing canonical`);
  if (!/<html lang="en">/i.test(html)) failures.push(`${name}: missing document language`);
  if (!/<main id="main-content">/i.test(html)) failures.push(`${name}: missing main landmark`);
  if (count(html, /<h1(?:\s|>)/gi) !== 1) failures.push(`${name}: expected exactly one h1`);
  if (/href="#"/i.test(html)) failures.push(`${name}: contains an empty hash link`);

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\salt="[^"]*"/i.test(image)) failures.push(`${name}: image missing alt text`);
  }
  for (const link of html.match(/<a\b[^>]*target="_blank"[^>]*>/gi) ?? []) {
    if (!/rel="[^"]*noopener[^"]*"/i.test(link)) failures.push(`${name}: new-tab link missing noopener`);
  }
  for (const block of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(block[1]); } catch { failures.push(`${name}: invalid JSON-LD`); }
  }

  if (title) {
    if (titles.has(title)) failures.push(`${name}: duplicate title also used by ${titles.get(title)}`);
    titles.set(title, name);
  }
  if (canonical) {
    if (canonicals.has(canonical)) failures.push(`${name}: duplicate canonical also used by ${canonicals.get(canonical)}`);
    canonicals.set(canonical, name);
  }
}

const notFound = await readFile(join(root, "404.html"), "utf8");
if (!/<meta name="robots" content="noindex, follow">/i.test(notFound)) failures.push("404.html: missing noindex");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`SEO/accessibility audit passed for ${titles.size} generated HTML pages.`);
