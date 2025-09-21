import { CommandScript } from "../command/command_script.ts";
import ObjectUtil from "./object_util.ts";

// Does not function correctly as a readonly within MetaImportUtil
const COMMAND_FILES: Record<string, { default: CommandScript }> =
  import.meta.glob<{ default: CommandScript }>("./**/*.ts", {
    eager: true,
    base: "/src/command/scripts",
  });

// Vite Glob imports with a base always have './' appended to the start of files found as per https://vite.dev/guide/features.html#base-path
ObjectUtil.removeKeyAffix(COMMAND_FILES, "./", ".ts");

export default class CommandImportUtil {
  /**
   * @returns a list of all existing {@link CommandScript}s.
   */
  // prettier-ignore
  public static getCommandScripts(): Record<string, { default: CommandScript }> {
    return COMMAND_FILES;
  }
}
