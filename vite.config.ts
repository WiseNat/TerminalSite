/// <reference types="vitest/config" />
import { defineConfig, PluginOption } from "vite";
import autoprefixer from "autoprefixer";
import FileTree from "./src/plugins/vite_plugin_file_tree";
import { visualizer } from "rollup-plugin-visualizer";

function isModeTesting(mode: string): boolean {
  return mode === "testing";
}

export default defineConfig(({ mode }) => {
  // Any contentDirectory changes must be mirrored in 'file_import_util.ts'
  const contentDirectory = isModeTesting(mode) ? "test/e2e/content" : "content";
  const homeDirectoryParent = isModeTesting(mode) ? "src/main" : "home";

  return {
    server: {
      port: isModeTesting(mode) ? 5174 : 5173,
    },
    plugins: [
      FileTree(contentDirectory, homeDirectoryParent),
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
