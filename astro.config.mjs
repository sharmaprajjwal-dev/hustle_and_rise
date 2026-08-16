// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hustleandrise.com",
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
        url: true,
      }),
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
        min: 20,
      }),
      SUPABASE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        min: 20,
      }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
        min: 20,
      }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        min: 20,
      }),
      PUBLIC_EMAIL_JOB_ENABLED: envField.boolean({ context: "client", access: "public", default: false }),
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_AD_PROVIDER: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_ADS_PREVIEW: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_AD_CLIENT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_AD_JOB_LIST_SLOT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_AD_BLOG_FEED_SLOT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_AD_ARTICLE_SLOT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_PRODUCTS_PREVIEW: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_INTERVIEW_WORKBOOK_URL: envField.string({ context: "client", access: "public", optional: true, url: true }),
      PUBLIC_JOB_TRACKER_URL: envField.string({ context: "client", access: "public", optional: true, url: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
