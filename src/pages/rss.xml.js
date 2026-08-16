import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  
  return rss({
    title: 'Hustle & Rise — Practical Work, Skills and Earning Guides',
    description: 'Practical guidance for finding work, preparing for interviews, building useful skills, and earning responsibly.',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      author: post.data.author,
      categories: [post.data.section, post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-NZ</language>`,
  });
}
