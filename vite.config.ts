// @lovable.dev/vite-tanstack-config already includes the required TanStack,
// React, Tailwind, Nitro, and TypeScript plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  nitro: {
    preset: "node-server",
  },

  vite: {
    server: {
      port: 5173,
      strictPort: true,
    },
  },
});
