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
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
