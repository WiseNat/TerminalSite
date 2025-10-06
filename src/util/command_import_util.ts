import { CommandScript } from "../command/command_script.ts";
import ObjectUtil from "./object_util.ts";

const COMMANDS: Record<string, { default: CommandScript }> = import.meta.glob<{
  default: CommandScript;
}>("./**/*.ts", {
  eager: true,
  base: "/src/command/scripts",
});

// Vite Glob imports with a base always have './' appended to the start of files found as per https://vite.dev/guide/features.html#base-path
ObjectUtil.removeKeyAffix(COMMANDS, "./", ".ts");
ObjectUtil.removeKeyPrefix(COMMANDS, "fake/");

export default class CommandImportUtil {
  /**
   * @returns a list of all existing {@link CommandScript}s.
   */
  // prettier-ignore
  public static getCommandScripts(): Record<string, { default: CommandScript }> {
    return COMMANDS;
  }
}
