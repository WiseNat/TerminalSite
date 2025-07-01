/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";

export default defineConfig(({ mode }) => {
  return {
    plugins: [],
    css: {
      postcss: {
        plugins: [autoprefixer({})],
      },
    },
    test: {},
    esbuild: {
      drop: mode === "production" ? ["console"] : [],
    },
  };
});
