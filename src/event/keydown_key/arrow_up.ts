import CommandHistoryUtil from "../../util/command_history_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";

/**
 * Processes the 'ArrowUp' key event. Handles cycling to older commands in the
 * command history, preserving the current user input when doing so.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processArrowUp(event: KeyboardEvent) {
  if (event.shiftKey) {
    return;
  }

  event.preventDefault();

  // Update current command with the user input
  const userInput = TerminalUtil.getUserInput();
  CommandHistoryUtil.setHistoricCommand(userInput);

  const wasIncrementSuccessful: boolean =
    CommandHistoryUtil.incrementHistoryIndex();

  // Only repaint the terminal if successful
  if (wasIncrementSuccessful) {
    const readOnlyContent = TerminalUtil.getReadOnlyContent();
    const historicCommand = CommandHistoryUtil.getHistoricCommand();
    TerminalUtil.setText(readOnlyContent + historicCommand);
  }
}
