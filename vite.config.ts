/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import FileTree from "./src/plugins/vite_plugin_file_tree";
import BuildChildRemover from "./src/plugins/vite_plugin_build_child_remover";

function isModeTesting(): boolean {
  return process.env.NODE_ENV === "testing";
}

export default defineConfig(({ mode }) => {
  const testingContentDirectory = "content/test";
  const productionContentDirectory = "content/production";

  const contentDirectory: string = isModeTesting()
    ? testingContentDirectory
    : productionContentDirectory;
  const homeDirectoryParent = isModeTesting() ? "src/main" : "home";

  return {
    appType: "mpa",
    server: {
      port: isModeTesting() ? 5174 : 5173,
    },
    plugins: [
      FileTree(`public/${contentDirectory}`, homeDirectoryParent),
      BuildChildRemover(
        [
          contentDirectory === testingContentDirectory
            ? productionContentDirectory
            : testingContentDirectory,
        ],
        [".meta", ".gitkeep"],
      ),
    ],
    define: {
      __HOME_DIRECTORY: JSON.stringify(`${homeDirectoryParent}/nathanwise`),
      __CONTENT_DIRECTORY: JSON.stringify(contentDirectory),
    },
    build: {
      cssMinify: "lightningcss",
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
