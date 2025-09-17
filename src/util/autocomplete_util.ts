import TerminalUtil from "./terminal_util.ts";
import MetaImportUtil from "./meta_import_util.ts";
import FileSystemUtil from "./file_system_util.ts";
import { Suggestion } from "../command/command_script.ts";

type PathRelatedSuggestion = {
  isDirectory: boolean;
  suggestion: Suggestion;
};

export default class AutocompleteUtil {
  /**
   * Autocompletes dependent on the provided suggestions.
   *
   * IF there are no suggestions -> nothing happens
   *
   * IF there is 1 value -> that value will be autocompleted
   *
   * IF more than 1 value exists -> all suggestions will be printed to the user
   *
   * @param suggestions suggestions to be considered for autocompletion, can be empty
   * @param userInput current user input, used to dictate what text will be appended when autocompleting.
   */
  public static autocomplete(suggestions: Suggestion[], userInput: string) {
    // Do nothing when there are no suggestions
    if (suggestions.length === 0) {
      return;
    }

    console.info(
      `Suggested values are '${suggestions.map((suggestion) => suggestion.actual)}'`,
    );

    // Autocomplete value if there's only 1 suggestion, otherwise output all suggestions
    if (suggestions.length === 1) {
      const suggestedValue = suggestions[0].actual;

      if (suggestedValue !== "") {
        console.info(`Autocompleting '${userInput}' with '${suggestedValue}'`);
        TerminalUtil.appendInput(suggestedValue);
      }
    } else {
      console.info("Providing a list of suggested autocompletion suggestions");

      const joinedSuggestions = suggestions
        .map((suggestion) => suggestion.visual)
        .join("\t");

      // TODO: Make this use TUI (columns) when that's implemented
      const prompt = TerminalUtil.getPrompt();
      TerminalUtil.appendOutput(
        `${prompt}${userInput}\n${joinedSuggestions}`,
        true,
      );
    }
  }

  /**
   * Gets a list of suggested commands for autocompletion which start with the same value as the `searchValue`.
   *
   * @param userInput the current user input
   * @param searchValue the value to search against
   * @returns a list of command suggestions
   */
  public static getCommandSuggestions(
    userInput: string,
    searchValue: string,
  ): Suggestion[] {
    const commandSuggestions: Suggestion[] = [];

    for (const commandScript in MetaImportUtil.getCommandScripts()) {
      const pathlessCommandScript =
        MetaImportUtil.removePathFromKey(commandScript);
      if (pathlessCommandScript.startsWith(searchValue)) {
        commandSuggestions.push({
          visual: pathlessCommandScript,
          actual: `${pathlessCommandScript} `.replace(userInput, ""),
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
      incompleteFinalPathSegment =
        incompleteFilePath[incompleteFilePath.length - 1];
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

        const suggestion: Suggestion = {
          visual: splitPath[splitPath.length - 1],
          actual: splitPath[splitPath.length - 1].replace(
            incompleteFinalPathSegment,
            "",
          ),
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
