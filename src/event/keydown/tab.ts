import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import getCommandScripts, {
  removePathFromCommandScriptKey,
} from "../../util/meta_import_util.ts";
import { userPrompt } from "../../constant/prompt.ts";

// TODO: JSDoc
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

  let values: string[];

  if (tokenisedCommand.args.length != 0) {
    // TODO: IF command has a custom autocomplete, call that, ELSE suggest directories & filenames
    values = [];
  } else {
    values = getCommandSuggestions(tokenisedCommand.name);
    // TODO: suggest directories when functionality for them is added, Bash suggests those despite them not working so
    //  that should be mirror-ed here.
  }

  autocomplete(values, userInput);
}

/**
 * Autocompletes dependent on the provided values.
 *
 * IF there are no values -> nothing happens
 *
 * IF there is 1 value -> that value will be autocompleted
 *
 * IF more than 1 value exists -> all values will be printed to the user
 *
 * @param values values to be considered for autocompletion, can be empty
 * @param userInput current user input, used to dictate what text will be appended when autocompleting.
 */
function autocomplete(values: string[], userInput: string) {
  // Do nothing when there are no suggestions
  if (values.length == 0) {
    return;
  }

  console.info(`Suggested values are '${values}'`);

  // Autocomplete value if there's only 1 suggestion, otherwise output all suggestions
  if (values.length == 1) {
    let suggestedValue = values[0];

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
    console.info("Providing a list of suggested autocompletion values");

    // TODO: Make this use TUI (columns) when that's implemented
    TerminalUtil.appendText(`\n${values.join("\t")}\n${userPrompt}`);
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
function getCommandSuggestions(searchValue: string): string[] {
  const commandSuggestions = [];

  for (const commandScript in getCommandScripts()) {
    const pathlessCommandScript = removePathFromCommandScriptKey(commandScript);
    if (pathlessCommandScript.startsWith(searchValue)) {
      commandSuggestions.push(pathlessCommandScript);
    }
  }

  return commandSuggestions;
}
