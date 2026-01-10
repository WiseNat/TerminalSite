import TerminalUtil from "./terminal_util.ts";
import CommandImportUtil from "./command_import_util.ts";
import FileSystemUtil from "./file_system_util.ts";
import { Suggestion } from "../command/command_script.ts";
import { ZERO_WIDTH_SPACE } from "../constant/char.ts";
import FormatterUtil from "./formatter_util.ts";

type PathRelatedSuggestion = {
  isDirectory: boolean;
  suggestion: Suggestion;
};

export default class AutocompleteUtil {
  /**
   * Autocompletes dependent on the provided suggestions.
   * - IF there are no suggestions -> nothing happens
   * - IF there is 1 value -> that value will be autocompleted
   * - IF more than 1 suggestion AND a common prefix for those suggestions -> the common prefix will be used for autocompletion
   * - IF more than 1 suggestion AND no common prefix for those suggestions -> all suggestions will be printed to the user
   *
   * @param suggestions suggestions to be considered for autocompletion, can be empty
   * @param beforeCaret current user input before the caret, used to dictate what text will be appended when autocompleting.
   * @param afterCaret current user input after the caret, used when setting the input when autocompleting.
   */
  public static autocomplete(
    suggestions: Suggestion[],
    beforeCaret: string,
    afterCaret: string,
  ) {
    // Do nothing when there are no suggestions
    if (suggestions.length === 0) {
      return;
    }

    console.info(
      `Suggested values are '${suggestions.map((suggestion) => suggestion.actual)}'`,
    );

    let suggestedValue: string;

    // Output suggestions if there's more than 1 suggestion AND no common prefix
    if (suggestions.length > 1) {
      const commonPrefix = this.getCommonPrefix(
        suggestions.map((suggestion) => suggestion.actual),
      );

      if (commonPrefix === "") {
        console.info(
          "Providing a list of suggested autocompletion suggestions",
        );

        const joinedSuggestions = FormatterUtil.toDynamicGrid(
          suggestions.map((suggestion) => suggestion.visual),
        );

        const prompt = TerminalUtil.getRawPrompt();
        TerminalUtil.appendRawOutput(
          `${prompt}${beforeCaret}${afterCaret}\n${joinedSuggestions}`,
          true,
        );

        return;
      }

      suggestedValue = commonPrefix;
    } else {
      suggestedValue = suggestions[0].actual;
    }

    if (suggestedValue === "") {
      return;
    }

    if (suggestedValue.endsWith(" ") && afterCaret !== "") {
      suggestedValue = suggestedValue.slice(0, -1);
    }

    if (!beforeCaret.startsWith(ZERO_WIDTH_SPACE)) {
      beforeCaret = ZERO_WIDTH_SPACE + beforeCaret;
    }

    console.info(`Autocompleting '${beforeCaret}' with '${suggestedValue}'`);
    TerminalUtil.setInput(beforeCaret + suggestedValue + afterCaret);
    TerminalUtil.cursorToIndex((beforeCaret + suggestedValue).length);
  }

  /**
   * Retrieves the common prefix amongst all provided `strings`.
   *
   * @example
   * const strings = [
   *   "ExampleFOO",
   *   "ExampleBAR",
   *   "ExampleBAZ"
   * ];
   *
   * const commonPrefix = AutocompleteUtil.getCommonPrefix(strings);
   * console.info(commonPrefix);
   * // "Example"
   *
   * @param strings
   * @private
   */
  private static getCommonPrefix(strings: string[]): string {
    if (strings.length === 0) {
      return "";
    }

    for (let i = 0; i < strings[0].length; i++) {
      const char = strings[0][i];
      if (!strings.every((s) => s[i] === char)) {
        return strings[0].slice(0, i);
      }
    }

    return strings[0];
  }

  /**
   * Gets a list of suggested commands for autocompletion which start with the same value as the `searchValue`.
   *
   * @param searchValue the value to search against
   * @returns a list of command suggestions
   */
  public static getCommandSuggestions(searchValue: string): Suggestion[] {
    const commandSuggestions: Suggestion[] = [];

    for (const commandScript in CommandImportUtil.getCommandScripts()) {
      if (commandScript.startsWith(searchValue)) {
        commandSuggestions.push({
          visual: commandScript,
          actual: `${commandScript} `.replace(searchValue, ""),
        });
      }
    }

    return commandSuggestions;
  }

  /**
   * Gets a list of suggested paths for autocompletion which start with the same value as the `searchValue`.
   * These suggestions categorise both Files and Directories.
   *
   * @param searchValue
   * @private
   *
   * @returns a list of path related suggestions
   */
  private static getPathRelatedSuggestions(
    searchValue: string,
  ): PathRelatedSuggestion[] {
    const incompleteFilePath = FileSystemUtil.resolvePathParts(
      searchValue,
      true,
    );

    if (incompleteFilePath === null) {
      return [];
    }

    let incompleteFinalPathSegment: string;
    let pathToWalk: string[];

    // Resolved path will never end with a '/' so comparisons are against the original searchPath
    if (searchValue.endsWith(FileSystemUtil.pathSeparator)) {
      incompleteFinalPathSegment = "";
      pathToWalk = incompleteFilePath;
    } else {
      incompleteFinalPathSegment = incompleteFilePath.at(-1) ?? "";
      pathToWalk = incompleteFilePath.slice(0, -1);
    }

    const node = FileSystemUtil.walkFileTree(pathToWalk);

    if (node === null) {
      return [];
    }

    if (!node.isDirectory || node.children === undefined) {
      return [];
    }

    const suggestions: PathRelatedSuggestion[] = [];

    for (const child of node.children) {
      if (child.name.startsWith(incompleteFinalPathSegment)) {
        const path = FileSystemUtil.joinPaths(child.path, child.name);
        const splitPath = FileSystemUtil.splitPath(path);

        const lastPathElement = splitPath.at(-1) ?? "";

        const suggestion: Suggestion = {
          visual: lastPathElement,
          actual: lastPathElement.replace(incompleteFinalPathSegment, ""),
        };

        if (child.isDirectory) {
          suggestion.visual += FileSystemUtil.pathSeparator;
          suggestion.actual += FileSystemUtil.pathSeparator;
        } else {
          suggestion.visual += " ";
          suggestion.actual += " ";
        }

        suggestions.push({
          isDirectory: child.isDirectory,
          suggestion: suggestion,
        });
      }
    }

    return suggestions;
  }

  /**
   * Gets a list of suggested files and directories for autocompletion which start with the same value as the `searchValue`.
   *
   * @param searchPath the value to search against
   * @returns a list of path suggestions
   */
  public static getFileAndDirectorySuggestions(
    searchPath: string,
  ): Suggestion[] {
    const pathRelatedSuggestions = this.getPathRelatedSuggestions(searchPath);

    return pathRelatedSuggestions.map((value) => value.suggestion);
  }

  /**
   * Gets a list of suggested directories for autocompletion which start with the same value as the last directory in
   * the `searchPath`.
   *
   * @param searchPath the path to search against
   * @returns a list of directory suggestions
   */
  public static getDirectorySuggestions(searchPath: string): Suggestion[] {
    const pathRelatedSuggestions = this.getPathRelatedSuggestions(searchPath);

    return pathRelatedSuggestions
      .filter((value) => value.isDirectory)
      .map((value) => value.suggestion);
  }

  /**
   * Gets a list of suggested files for autocompletion which start with the same value as the last filename in
   * the `searchPath`.
   *
   * @param searchPath the path to search against
   * @returns a list of file suggestions
   */
  public static getFileSuggestions(searchPath: string): Suggestion[] {
    const pathRelatedSuggestions = this.getPathRelatedSuggestions(searchPath);

    return pathRelatedSuggestions
      .filter((value) => !value.isDirectory)
      .map((value) => value.suggestion);
  }
}
