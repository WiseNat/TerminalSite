import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import AutocompleteUtil from "../../util/autocomplete_util.ts";
import TokenisedCommand from "../../dto/tokenised_command.ts";
import { Suggestion } from "../../command/command_script.ts";
import { ZERO_WIDTH_SPACE } from "../../constant/char.ts";
import HtmlUtil from "../../util/html_util.ts";

/**
 * Processes the 'Tab' key event. This will perform autocompletion of values in the terminal, either
 * 1. With a custom command specific autocomplete
 * 2. With a default autocomplete with command and directories as values
 *
 * @param event
 */
export async function processTab(event: KeyboardEvent) {
  event.preventDefault();

  const input = TerminalUtil.getRawInput();
  const offset = HtmlUtil.getCaretPosition(TerminalUtil.getInputElement());
  const beforeCaret = input.substring(0, offset).replace(ZERO_WIDTH_SPACE, "");
  const afterCaret = input.substring(offset).replace(ZERO_WIDTH_SPACE, "");

  console.warn(
    `Caret is at '${offset}'. Content before caret is '${beforeCaret}' and after is '${afterCaret}'`,
  );

  // We don't want suggestions provided when nothing exists in the user input
  if (beforeCaret === "") {
    return;
  }

  const tokenisedCommand = CommandUtil.tokenise(beforeCaret);
  let suggestions: Suggestion[];

  if (tokenisedCommand.args.length === 0 && !beforeCaret.endsWith(" ")) {
    suggestions = defaultAutocomplete(tokenisedCommand);
  } else {
    suggestions = await customCommandAutocomplete(
      beforeCaret,
      tokenisedCommand,
    );
  }

  AutocompleteUtil.autocomplete(suggestions, beforeCaret, afterCaret);
}

/**
 * Handles custom command autocompletion.
 *
 * @param beforeCaret
 * @param tokenisedCommand
 *
 * @returns values from the custom command autocomplete or directory & file suggestions if the method returns null or
 * doesn't exist.
 */
async function customCommandAutocomplete(
  beforeCaret: string,
  tokenisedCommand: TokenisedCommand,
): Promise<Suggestion[]> {
  const commandScript = CommandUtil.getCommandScript(tokenisedCommand);

  if (commandScript?.autocomplete) {
    const suggestions = await commandScript.autocomplete(
      beforeCaret,
      tokenisedCommand.args,
    );

    if (suggestions != null) {
      return suggestions;
    }
  }

  console.info(
    `'${tokenisedCommand.name}' command or it's autocomplete were not found, resorting to file & directory autocompletion`,
  );

  if (tokenisedCommand.args.length === 0 || beforeCaret.endsWith(" ")) {
    return [];
  }

  const searchValue = tokenisedCommand.args.at(-1)!;
  return AutocompleteUtil.getFileAndDirectorySuggestions(searchValue);
}

/**
 * Handles default autocompletion.
 *
 * @param beforeCaret
 * @param tokenisedCommand
 *
 * @returns command name, directory, and file suggestions
 */
function defaultAutocomplete(tokenisedCommand: TokenisedCommand): Suggestion[] {
  const searchTerm = tokenisedCommand.name;

  const suggestions: Suggestion[] =
    AutocompleteUtil.getCommandSuggestions(searchTerm);

  return suggestions.concat(
    AutocompleteUtil.getFileAndDirectorySuggestions(searchTerm),
  );
}
