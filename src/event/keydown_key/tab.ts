import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import AutocompleteUtil from "../../util/autocomplete_util.ts";
import TokenisedCommand from "../../dto/tokenised_command.ts";
import { Suggestion } from "../../command/command_script.ts";

/**
 * Processes the 'Tab' key event. This will perform autocompletion of values in the terminal, either
 * 1. With a custom command specific autocomplete
 * 2. With a default autocomplete with command and directories as values
 *
 * @param event
 */
export async function processTab(event: KeyboardEvent) {
  event.preventDefault();

  const userInput = TerminalUtil.getUserInput();

  // We don't want suggestions provided when nothing exists in the user input
  if (userInput === "") {
    return;
  }

  const tokenisedCommand = CommandUtil.tokenise(userInput);
  let suggestions: Suggestion[];

  if (tokenisedCommand.args.length !== 0 || userInput.endsWith(" ")) {
    suggestions = await customCommandAutocomplete(tokenisedCommand);
  } else {
    suggestions = defaultAutocomplete(tokenisedCommand);
  }

  AutocompleteUtil.autocomplete(suggestions, userInput);
}

/**
 * Handles custom command autocompletion.
 *
 * @param tokenisedCommand
 *
 * @returns values from the custom command autocomplete or directory & file suggestions if the method returns null or
 * doesn't exist.
 */
async function customCommandAutocomplete(
  tokenisedCommand: TokenisedCommand,
): Promise<Suggestion[]> {
  const commandScript = CommandUtil.getCommandScript(tokenisedCommand);

  if (commandScript?.autocomplete) {
    const suggestions = await commandScript.autocomplete(tokenisedCommand.args);

    if (suggestions != null) {
      return suggestions;
    }
  }

  const searchPath = tokenisedCommand.args[tokenisedCommand.args.length - 1];

  let suggestions = AutocompleteUtil.getDirectorySuggestions(searchPath);
  suggestions = suggestions.concat(
    AutocompleteUtil.getFileSuggestions(searchPath),
  );

  return suggestions;
}

/**
 * Handles default autocompletion.
 *
 * @param tokenisedCommand
 *
 * @returns command name, directory, and file suggestions
 */
function defaultAutocomplete(tokenisedCommand: TokenisedCommand): Suggestion[] {
  let suggestions: Suggestion[] = AutocompleteUtil.getCommandSuggestions(
    tokenisedCommand.name,
  );
  suggestions = suggestions.concat(
    AutocompleteUtil.getDirectorySuggestions(tokenisedCommand.name),
  );
  suggestions = suggestions.concat(
    AutocompleteUtil.getFileSuggestions(tokenisedCommand.name),
  );

  return suggestions;
}
