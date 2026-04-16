import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().describe("SEO meta description (120-160 chars recommended)"),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional().describe("Featured image URL (1200x630px recommended)"),
    category: z.enum(["Digital Income", "Hustler Finance", "Mindset"]).default("Digital Income"),
    author: z.string().default("Hustle & Rise Team"),
    readTime: z.string().default("5 min read"),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    metaDescription: z.string().optional().describe("Custom meta description"),
    authorName: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
