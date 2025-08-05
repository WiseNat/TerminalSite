import TerminalUtil from "./terminal_util.ts";
import { userPrompt } from "../constant/prompt.ts";
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
      const suggestion = suggestions[0];

      // Should search left to right, finding "userInput" at the start of "suggestedValue"
      const suggestedValue = suggestion.actual.replace(userInput, "");

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
      TerminalUtil.appendOutput(
        `${userPrompt}${userInput}\n${joinedSuggestions}\n`,
      );
    }
  }

  /**
   * Gets a list of suggested commands for autocompletion which start with the same value as the `searchValue`.
   *
   * @param searchValue the value to search against
   * @returns a list of command suggestions
   */
  public static getCommandSuggestions(searchValue: string): Suggestion[] {
    const commandSuggestions: Suggestion[] = [];

    for (const commandScript in MetaImportUtil.getCommandScripts()) {
      const pathlessCommandScript =
        MetaImportUtil.removePathFromKey(commandScript);
      if (pathlessCommandScript.startsWith(searchValue)) {
        commandSuggestions.push({
          visual: pathlessCommandScript,
          actual: pathlessCommandScript + " ",
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
    const incompleteFilePath = FileSystemUtil.resolvePathParts(searchValue);

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
        const joinedPath = FileSystemUtil.joinPaths(child.path, child.name);

        const suggestion: Suggestion = {
          visual: joinedPath[joinedPath.length - 1],
          actual: FileSystemUtil.formatPath(joinedPath),
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
