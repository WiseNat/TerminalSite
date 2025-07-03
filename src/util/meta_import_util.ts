import { CommandScript } from "../command/command_script.ts";

// TODO: Util?..

// Vite does not allow non-literal values for Glob imports as per https://vite.dev/guide/features.html#glob-import-caveats
// The below needs to be manually updated if the glob path is changed
const path = "/src/command/scripts/";
const typescriptExtension = ".ts";

const commandFiles = import.meta.glob<{ default: CommandScript }>(
  "/src/command/scripts/*.ts",
  { eager: true },
);

// TODO: JSDoc
export default function getCommandScripts(): Record<
  string,
  { default: CommandScript }
> {
  return commandFiles;
}

// TODO: JSDoc
// TODO: unit tests
export function getCommandScriptKey(pathlessKey: string): string {
  return `${path}${pathlessKey}${typescriptExtension}`;
}

// TODO: JSDoc
// TODO: unit tests
export function removePathFromCommandScriptKey(key: string): string {
  if (key.startsWith(path)) {
    key = key.replace(path, "");
  }

  if (key.endsWith(typescriptExtension)) {
    key = key.replace(typescriptExtension, "");
  }

  return key;
}
