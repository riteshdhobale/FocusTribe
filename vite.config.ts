// Lovable's config is tied to Cloudflare. This is now a clean Vite config.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: {
      preset: "netlify",
    },
  },
});
