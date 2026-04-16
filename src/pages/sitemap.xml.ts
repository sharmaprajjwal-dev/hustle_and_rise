import { getCollection } from 'astro:content';

export async function GET() {
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);
  
  // Base URL - change this to your domain
  const SITE_URL = 'https://hustleandrise.com';
  
  // Static pages
  const staticPages = [
    { url: '', lastmod: new Date().toISOString().split('T')[0], priority: '1.0' },
    { url: 'blog', lastmod: new Date().toISOString().split('T')[0], priority: '0.9' },
    { url: 'about', lastmod: new Date().toISOString().split('T')[0], priority: '0.8' },
    { url: 'contact', lastmod: new Date().toISOString().split('T')[0], priority: '0.8' },
    { url: 'privacy', lastmod: new Date().toISOString().split('T')[0], priority: '0.5' },
    { url: 'terms', lastmod: new Date().toISOString().split('T')[0], priority: '0.5' },
  ];
  
  // Blog posts
  const blogUrls = blogPosts
    .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime())
    .map((post) => ({
      url: `blog/${post.slug}`,
      lastmod: post.data.updatedDate 
        ? new Date(post.data.updatedDate).toISOString().split('T')[0]
        : new Date(post.data.pubDate).toISOString().split('T')[0],
      priority: '0.8',
    }));
  
  const allPages = [...staticPages, ...blogUrls];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `
  <url>
    <loc>${SITE_URL}/${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>
`.trim()
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}