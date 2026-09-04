import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages project site is served under /somalab-homepage/.
// Switch to "/" if you later attach a custom domain.
export default defineConfig({
  plugins: [react()],
  base: "/somalab-homepage/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
