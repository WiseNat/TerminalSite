/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import FileTree from "./src/plugins/vite_plugin_file_tree";

export default defineConfig(({ mode }) => {
  return {
    plugins: [FileTree("src/content")],
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
