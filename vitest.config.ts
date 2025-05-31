import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: [
      {
        test: {
          name: "Unit",
          include: ["test/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "Integration",
          include: ["test/integration/**/*.test.ts"],
          environment: "jsdom",
        },
      },
    ],
  },
});
