import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      defineConfig({
        test: {
          name: "Unit",
          include: ["test/unit/**/*.test.ts"],
          environment: "node",
          clearMocks: true,
        },
      }),
      defineConfig({
        test: {
          name: "Integration",
          include: ["test/integration/**/*.test.ts"],
          environment: "jsdom",
          clearMocks: true,
        },
      }),
    ],
  },
});
