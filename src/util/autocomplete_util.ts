import TerminalUtil from "./terminal_util.ts";
import { userPrompt } from "../constant/prompt.ts";
import MetaImportUtil from "./meta_import_util.ts";

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
  public static autocomplete(suggestions: string[], userInput: string) {
    // Do nothing when there are no suggestions
    if (suggestions.length === 0) {
      return;
    }

    console.info(`Suggested values are '${suggestions}'`);

    // Autocomplete value if there's only 1 suggestion, otherwise output all suggestions
    if (suggestions.length === 1) {
      let suggestedValue = suggestions[0];

      // We want to append whitespace to the end of a command if it's missing, but we don't want to append any additional
      // whitespace after that, e.g. going from "command⸱" to "command⸱⸱"
      if (`${suggestedValue} ` === userInput) {
        return;
      }

      // Should search left to right, finding "userInput" at the start of "suggestedValue"
      suggestedValue = suggestedValue.replace(userInput, "");

      console.info(`Autocompleting with '${suggestedValue}'`);
      TerminalUtil.appendText(`${suggestedValue} `);
    } else {
      console.info("Providing a list of suggested autocompletion suggestions");

      // TODO: Make this use TUI (columns) when that's implemented
      TerminalUtil.appendText(`\n${suggestions.join("\t")}\n${userPrompt}`);
      TerminalUtil.updateReadOnlyIndex();
      TerminalUtil.appendText(userInput);
    }
  }

  /**
   * Gets a list of suggested commands for autocompletion which start with the same value as the `searchValue`.
   *
   * @param searchValue the value to search against
   * @returns a list of command suggestions
   */
  public static getCommandSuggestions(searchValue: string): string[] {
    const commandSuggestions = [];

    for (const commandScript in MetaImportUtil.getCommandScripts()) {
      const pathlessCommandScript =
        MetaImportUtil.removePathFromKey(commandScript);
      if (pathlessCommandScript.startsWith(searchValue)) {
        commandSuggestions.push(pathlessCommandScript);
      }
    }

    return commandSuggestions;
  }

  /**
   * Gets a list of suggested directories for autocompletion which start with the same value as the last directory in
   * the `searchPath`.
   *
   * @param searchPath the path to search against
   * @returns a list of directory suggestions
   */
  public static getDirectorySuggestions(searchPath: string): string[] {
    // TODO: implement when directories are implemented
    console.info(`getDirectorySuggestions called with '${searchPath}'`);
    return [];
  }

  /**
   * Gets a list of suggested files for autocompletion which start with the same value as the last filename in
   * the `searchPath`.
   *
   * @param searchPath the path to search against
   * @returns a list of file suggestions
   */
  public static getFileSuggestions(searchPath: string): string[] {
    // TODO: implement when files are implemented
    console.info(`getFileSuggestions called with '${searchPath}'`);
    return [];
  }
}
