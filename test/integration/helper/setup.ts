import { vi } from "vitest";
// eslint-disable-next-line @typescript-eslint/naming-convention
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
