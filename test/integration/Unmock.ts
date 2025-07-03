import { vi } from "vitest";

export async function unmock(import_path: string, method: string) {
  const module = await import(import_path);
  module[method] = (await vi.importActual(import_path))[method];
}
