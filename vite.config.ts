/// <reference types="vitest/config" />
import { defineConfig, PluginOption } from "vite";
import autoprefixer from "autoprefixer";
import FileTree from "./src/plugins/vite_plugin_file_tree";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const homeDirectoryParent = mode === "testing" ? "src/main" : "home";

  return {
    plugins: [
      mode === "testing"
        ? FileTree("test/e2e/content", homeDirectoryParent)
        : FileTree("src/content", homeDirectoryParent),
      visualizer({ brotliSize: true, gzipSize: true }) as PluginOption,
    ],
    define: {
      __HOME_DIRECTORY: JSON.stringify(`${homeDirectoryParent}/nathanwise`),
    },
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
