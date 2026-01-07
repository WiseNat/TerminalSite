import { Flavour } from "../flavour/flavour.ts";
import FlavourImportUtil from "./flavour_import_util.ts";
import TerminalUtil from "./terminal_util.ts";
import FileSystemUtil from "./file_system_util.ts";

export default class FlavourUtil {
  private static currentShellFlavour: Flavour;

  /**
   * Resets the current shell flavour to be null.
   *
   * @internal **intended to be solely used by Tests**
   */
  public static _resetCurrentShellFlavour() {
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    this.currentShellFlavour = undefined;
  }

  /**
   * @returns the Current Shell Flavour.
   */
  public static getCurrentShellFlavour(): Flavour {
    return this.currentShellFlavour;
  }

  /**
   * Set the Current Shell Flavour as the provided `flavour`.
   * Updates the Terminal Prompt to match.
   *
   * @param flavour the value to set.
   */
  public static setCurrentShellFlavour(flavour: Flavour): void {
    this.currentShellFlavour = flavour;

    TerminalUtil.setPromptPath(
      FileSystemUtil.formatPath(FileSystemUtil.getCurrentWorkingDirectory()),
    );
  }

  /**
   * Gets the flavour with a name that resolves to the `flavourName`.
   *
   * @param flavourName the name of the flavour
   * @returns the {@link Flavour} if it is found, null otherwise.
   */
  public static getShellFlavour(flavourName: string): Flavour | null {
    const flavour = FlavourImportUtil.getFlavours()[flavourName];

    if (flavour === undefined) {
      console.warn(`Flavour "${flavourName}" not found.`);
      return null;
    }

    return flavour.default;
  }

  // TODO: Unit test
  /**
   * @returns the names of all available {@link Flavour}s.
   */
  public static getFlavours(): string[] {
    const flavourScripts = FlavourImportUtil.getFlavours();
    const flavours: string[] = [];

    for (const flavour of Object.keys(flavourScripts)) {
      flavours.push(flavour);
    }

    return flavours;
  }
}
