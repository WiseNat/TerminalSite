import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import AutocompleteUtil from "../../util/autocomplete_util.ts";

/**
 * Processes the 'Tab' key event. This will perform autocompletion of values in the terminal, either
 * 1. With a custom command specific autocomplete
 * 2. With a default autocomplete with command and directories as values
 *
 * @param event
 */
export function processTab(event: KeyboardEvent) {
  event.preventDefault();

  const userInput = TerminalUtil.getUserInput();
  if (userInput == "") {
    // We don't want suggestions provided when nothing exists in the user input
    return;
  }

  const tokenisedCommand = CommandUtil.tokenise(userInput);

  let values: string[] | undefined;

  if (tokenisedCommand.args.length != 0 || userInput.endsWith(" ")) {
    const commandScript = CommandUtil.getCommandScript(tokenisedCommand);

    if (commandScript?.autocomplete) {
      const customValues = commandScript.autocomplete(tokenisedCommand.args);

      if (customValues != null) {
        values = customValues;
      }
    }

    if (values == undefined) {
      const searchPath =
        tokenisedCommand.args[tokenisedCommand.args.length - 1];

      values = AutocompleteUtil.getDirectorySuggestions(searchPath);
      values = values.concat(AutocompleteUtil.getFileSuggestions(searchPath));
    }
  } else {
    values = AutocompleteUtil.getCommandSuggestions(tokenisedCommand.name);
    values = values.concat(
      AutocompleteUtil.getDirectorySuggestions(tokenisedCommand.name),
    );
    values = values.concat(
      AutocompleteUtil.getFileSuggestions(tokenisedCommand.name),
    );
  }

  AutocompleteUtil.autocomplete(values, userInput);
}
