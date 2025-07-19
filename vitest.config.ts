import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    projects: [
      defineConfig({
        test: {
          name: "Unit",
          include: ["test/unit/**/*.test.ts"],
          environment: "node",
          clearMocks: true,
          alias: {
            "virtual:file-tree": resolve(
              __dirname,
              "test/integration/helper/file_tree_mock.ts",
            ),
          },
        },
      }),
      defineConfig({
        test: {
          name: "Integration",
          include: ["test/integration/**/*.test.ts"],
          environment: "jsdom",
          clearMocks: true,
          setupFiles: ["test/integration/helper/setup.ts"],
          alias: {
            "virtual:file-tree": resolve(
              __dirname,
              "test/integration/helper/file_tree_mock.ts",
            ),
          },
        },
      }),
    ],
  },
});
