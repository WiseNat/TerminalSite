import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import CommandHistoryUtil from "../../util/command_history_util.ts";

/**
 * Processes the 'Enter' key event. This will either
 * 1. Allow a newline if Shift+Return is being pressed
 * 2. Execute a command if Shift+Return is not pressed
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processEnter(event: KeyboardEvent) {
  if (event.shiftKey) {
    TerminalUtil.appendText("\n");
    return;
  }

  const userInput = TerminalUtil.getUserInput();
  await CommandUtil.executeCommand(userInput);

  updateCommandHistory(userInput);
}

/**
 * Updates the command history with the given `userInput`. This always ensures
 * that there is a "user input" entry available for the next
 * `updateCommandHistory` call.
 *
 * @param userInput values to include in the command history.
 */
function updateCommandHistory(userInput: string) {
  if (CommandHistoryUtil.getHistory().length === 0) {
    CommandHistoryUtil.addToHistory(userInput);
  } else {
    CommandHistoryUtil.resetHistoryIndex();
    CommandHistoryUtil.setHistoricCommand(userInput);
  }

  // Add a new user input entry
  CommandHistoryUtil.addToHistory("");
}
