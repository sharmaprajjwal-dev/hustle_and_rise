import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  
  return rss({
    title: 'Hustle & Rise — Digital Entrepreneurship & Income Strategies',
    description: 'Actionable guides on building digital income streams, scaling hustle, and developing an entrepreneurial mindset. Real strategies from real builders.',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      author: post.data.author,
      categories: [post.data.category],
    })),
    customData: `<language>en-us</language>`,
  });
}
