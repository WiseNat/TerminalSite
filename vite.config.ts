/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import FileTree from "./src/plugins/vite_plugin_file_tree";
import BuildChildRemover from "./src/plugins/vite_plugin_build_child_remover";

function isModeTesting(mode: string): boolean {
  return mode === "testing";
}

export default defineConfig(({ mode }) => {
  const contentDirectory: string = isModeTesting(mode)
    ? "content/test"
    : "content/production";
  const homeDirectoryParent = isModeTesting(mode) ? "src/main" : "home";

  return {
    appType: "mpa",
    server: {
      port: isModeTesting(mode) ? 5174 : 5173,
    },
    plugins: [
      FileTree(`public/${contentDirectory}`, homeDirectoryParent),
      BuildChildRemover([contentDirectory], [".meta", ".gitkeep"]),
    ],
    define: {
      __HOME_DIRECTORY: JSON.stringify(`${homeDirectoryParent}/nathanwise`),
      __CONTENT_DIRECTORY: JSON.stringify(contentDirectory),
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
