import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";

/**
 * Processes the 'Enter' key event. This will either
 * 1. Allow a newline if Shift+Return is being pressed
 * 2. Execute a command if Shift+Return is not pressed
 *
 * @param event event listener {@link KeyboardEvent}
 */
export function processEnter(event: KeyboardEvent) {
  if (event.shiftKey) {
    TerminalUtil.appendText("\n");
    return;
  }

  const userInput = TerminalUtil.getUserInput();
  CommandUtil.executeCommand(userInput);
}
