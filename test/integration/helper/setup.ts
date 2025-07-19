import { vi } from "vitest";
const { fs } = await import("memfs");

vi.mock("node:fs", async () => {
  return {
    ...fs,
    default: fs,
  };
});

vi.mock("node:fs/promises", async () => {
  return {
    ...fs.promises,
    default: fs.promises,
  };
});
