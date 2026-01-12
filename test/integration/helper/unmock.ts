import { vi } from "vitest";
import { get, set } from "lodash-es";

export async function unmock(import_path: string, methods: string[]) {
  const module = await import(import_path);
  const actualModule = await vi.importActual(import_path);

  const path = methods.join(".");
  const actualProperty = get(actualModule, path);

  set(module, path, actualProperty);
}
