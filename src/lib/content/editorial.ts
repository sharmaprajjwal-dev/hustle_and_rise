import { getCollection, type CollectionEntry } from "astro:content";

export const editorialSections = {
  interview: { label: "Interview Prep", href: "/interview", accent: "#5b5ce2" },
  career: { label: "Career Toolkit", href: "/career", accent: "#ff6b35" },
  "side-hustles": { label: "Student Side Hustles", href: "/side-hustles", accent: "#23b9b3" },
  money: { label: "Money & Student Life", href: "/blog?section=money", accent: "#d78a18" },
  tools: { label: "Tools & Resources", href: "/tools", accent: "#735ed8" },
} as const;

export type EditorialSection = keyof typeof editorialSections;
export type EditorialPost = CollectionEntry<"blog">;

export async function getPublishedPosts(): Promise<EditorialPost[]> {
  return (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getSectionPosts(section: EditorialSection): Promise<EditorialPost[]> {
  return (await getPublishedPosts()).filter((post) => post.data.section === section);
}

export function getRelatedPosts(post: EditorialPost, posts: EditorialPost[], limit = 3): EditorialPost[] {
  const explicit = new Set(post.data.relatedPosts);
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .sort((a, b) => {
      const aScore = (explicit.has(a.id) ? 10 : 0) + (a.data.section === post.data.section ? 3 : 0) + a.data.tags.filter((tag) => post.data.tags.includes(tag)).length;
      const bScore = (explicit.has(b.id) ? 10 : 0) + (b.data.section === post.data.section ? 3 : 0) + b.data.tags.filter((tag) => post.data.tags.includes(tag)).length;
      return bScore - aScore || b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    })
    .slice(0, limit);
}

export function getPostsForJobCategory(posts: EditorialPost[], category: string | null, limit = 3): EditorialPost[] {
  if (!category) return [];
  const needle = category.toLowerCase();
  return posts
    .filter((post) => post.data.relatedJobCategories.some((item) => item.toLowerCase() === needle))
    .slice(0, limit);
}
