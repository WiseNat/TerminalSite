import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    reporters: ["minimal"],

    // Only enable when debugging as this massively slows down tests - https://vitest.dev/config/detectasyncleaks.html#detectasyncleaks
    // detectAsyncLeaks: true,

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
              "test/unit/helper/file_tree_mock.ts",
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
