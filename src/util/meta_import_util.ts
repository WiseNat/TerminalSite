import { CommandScript } from "../command/command_script.ts";

// Does not function correctly as a readonly within MetaImportUtil
const commandFiles = import.meta.glob<{ default: CommandScript }>("./**/*.ts", {
  eager: true,
  base: "/src/command/scripts",
});

export default class MetaImportUtil {
  // Vite Glob imports with a base always have './' appended to the start of files found as per https://vite.dev/guide/features.html#base-path
  // This should be removed for easy access to commands.
  static readonly path = "./";
  static readonly typescriptExtension = ".ts";

  /**
   * @returns a list of all existing {@link CommandScript}s.
   */
  // prettier-ignore
  public static getCommandScripts(): Record<string, { default: CommandScript }> {
    return commandFiles;
  }

  /**
   * Gets a key without a path for {@link getCommandScripts}.
   *
   * @example
   * const command = "echo";
   * const key = MetaImportUtil.getKey(command);
   * const echoCommandScript = MetaImportUtil.getCommandScripts()[key];
   *
   * echoCommandScript.default.run(["some", "args"]);
   *
   * @param pathlessKey command script key without a path, e.g. `echo`
   *
   * @returns a key with a path added.
   */
  public static getKey(pathlessKey: string): string {
    return `${this.path}${pathlessKey}${this.typescriptExtension}`;
  }

  /**
   * Removes a path from a key, typically used for keys created by {@link getKey} or from {@link getCommandScripts}.
   *
   * @example
   * const keys = [];
   * for (const commandScript in MetaImportUtil.getCommandScripts()) {
   *   const key = MetaImportUtil.removePathFromKey(commandScript);
   *   keys.push(key);
   * }
   *
   * console.log(keys); // => [ 'clear', 'echo' ]
   * @example
   * const command = "echo";
   * const key = MetaImportUtil.getKey(command);
   * const commandAgain = MetaImportUtil.removePathFromKey(key);
   *
   * console.log(command == commandAgain); // => true
   *
   * @param key a key with a path.
   *
   * @returns a key with the path removed.
   */
  public static removePathFromKey(key: string): string {
    if (key.startsWith(this.path)) {
      key = key.replace(this.path, "");
    }

    if (key.endsWith(this.typescriptExtension)) {
      key = key.replace(this.typescriptExtension, "");
    }

    return key;
  }
}
