import {
  PUBLIC_AD_ARTICLE_SLOT_ID,
  PUBLIC_AD_BLOG_FEED_SLOT_ID,
  PUBLIC_AD_CLIENT_ID,
  PUBLIC_AD_JOB_LIST_SLOT_ID,
  PUBLIC_AD_PROVIDER,
  PUBLIC_ADS_PREVIEW,
  PUBLIC_INTERVIEW_WORKBOOK_URL,
  PUBLIC_JOB_TRACKER_URL,
  PUBLIC_PRODUCTS_PREVIEW,
} from "astro:env/client";

export type AdPlacement = "job-list" | "blog-feed" | "article";
export type ProductKey = "interview-workbook" | "job-tracker";

export const ads = {
  provider: PUBLIC_AD_PROVIDER?.trim().toLowerCase() ?? "none",
  preview: PUBLIC_ADS_PREVIEW === "true",
  clientId: PUBLIC_AD_CLIENT_ID?.trim(),
  slots: {
    "job-list": PUBLIC_AD_JOB_LIST_SLOT_ID?.trim(),
    "blog-feed": PUBLIC_AD_BLOG_FEED_SLOT_ID?.trim(),
    article: PUBLIC_AD_ARTICLE_SLOT_ID?.trim(),
  },
};

export const products = {
  preview: PUBLIC_PRODUCTS_PREVIEW === "true",
  items: {
    "interview-workbook": {
      title: "Interview Answer Workbook",
      description: "Turn your experience into clear, natural STAR examples before your next interview.",
      url: PUBLIC_INTERVIEW_WORKBOOK_URL,
      cta: "View the workbook",
    },
    "job-tracker": {
      title: "Simple Job Application Tracker",
      description: "Keep applications, follow-ups, and next actions in one practical template.",
      url: PUBLIC_JOB_TRACKER_URL,
      cta: "View the tracker",
    },
  },
} as const;
