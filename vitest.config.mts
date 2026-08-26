import path from "node:path";
import { defineConfig } from "vitest/config";

/* No vitest config previously existed, so the "@/*" alias tsconfig.json
   declares was never wired up for test runs — any test file that imports
   something which transitively pulls in an "@/..." import (nav.test.ts,
   landing-data.test.ts) failed to even load. Mirrors tsconfig.json's path
   mapping exactly. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
