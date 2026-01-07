import { Flavour, TextContent } from "../flavour/flavour.ts";
import FlavourImportUtil from "./flavour_import_util.ts";
import TerminalUtil from "./terminal_util.ts";
import FileSystemUtil from "./file_system_util.ts";
import UNIX from "../flavour/implementation/Unix.ts";

export default class FlavourUtil {
  private static currentShellFlavour: Flavour;
  private static readonly flavourStorageKey = "flavour";

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
   * Set up the current flavour; intended to be called on page load. Sets up:
   * - Current Shell Flavour ({@link setupCurrentShellFlavour})
   * - Initial Prompt
   */
  public static setup() {
    this.setupCurrentShellFlavour();

    const initialPrompt: TextContent =
      this.currentShellFlavour.getInitialPrompt();
    if (initialPrompt.isHTML) {
      TerminalUtil.setRawOutput(initialPrompt.value);
    } else {
      TerminalUtil.setOutput(initialPrompt.value);
    }
  }

  /**
   * Set up the Current Shell Flavour either with a session storage value if it
   * exists, or Unix. **Should only be called once!**
   * @private
   */
  private static setupCurrentShellFlavour() {
    if (this.currentShellFlavour !== undefined) {
      console.warn(
        "The FlavourUtil setupCurrentShellFlavour method should not be called multiple times!",
      );
      return;
    }

    const flavourName = sessionStorage.getItem(this.flavourStorageKey);

    if (flavourName !== null) {
      const flavour = this.getShellFlavour(flavourName);

      if (flavour !== null) {
        this.setCurrentShellFlavour(flavour);
        return;
      }
    }

    this.setCurrentShellFlavour(UNIX);
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

    // Would be optimal to request the name as an arg but from an API perspective
    // this would seem odd. Using the below unoptimised search instead.
    for (const [key, value] of Object.entries(
      FlavourImportUtil.getFlavours(),
    )) {
      if (value.default === flavour) {
        sessionStorage.setItem(this.flavourStorageKey, key);
      }
    }

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
