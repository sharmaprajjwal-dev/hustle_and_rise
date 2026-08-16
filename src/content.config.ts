import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blogCollection = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().describe("SEO meta description (120-160 chars recommended)"),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional().describe("Featured image URL (1200x630px recommended)"),
    section: z.enum(["interview", "career", "side-hustles", "money", "tools"]),
    category: z.string().min(2),
    author: z.string().default("Hustle & Rise Team"),
    readTime: z.string().default("5 min read"),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    metaDescription: z.string().optional().describe("Custom meta description"),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    relatedJobCategories: z.array(z.string()).default([]),
    relatedPosts: z.array(z.string()).default([]),
    authorName: z.string().optional(),
    product: z.enum(["interview-workbook", "job-tracker"]).optional(),
  }),
});

const trainingCollection = defineCollection({
  loader: glob({ base: "./src/content/training", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["planned", "upcoming", "active", "closed"]),
    duration: z.string(),
    skillLevel: z.string(),
    deliveryMode: z.enum(["online", "in-person", "hybrid"]),
    category: z.string(),
    price: z.string().optional(),
    startDate: z.coerce.date().optional(),
    schedule: z.string().optional(),
    instructor: z.string().optional(),
    enrolmentUrl: z.string().optional(),
    heroImage: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    requirements: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  training: trainingCollection,
};
