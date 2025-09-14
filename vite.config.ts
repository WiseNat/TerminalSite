/// <reference types="vitest/config" />
import { defineConfig, PluginOption } from "vite";
import autoprefixer from "autoprefixer";
import fileTree from "./src/plugins/vite_plugin_file_tree";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      fileTree("src/content", "home"),
      visualizer({ brotliSize: true, gzipSize: true }) as PluginOption,
    ],
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
