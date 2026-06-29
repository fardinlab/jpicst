import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "mobile",
  base: "./",
  publicDir: "../public",
  plugins: [tailwindcss(), tsConfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] }), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});