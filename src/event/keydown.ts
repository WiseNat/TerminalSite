import TerminalUtil from "../util/terminal_util.ts";
import CommandUtil from "../util/command_util.ts";

/**
 * TODO
 *
 * @param event event listener {@link KeyboardEvent}
 */
export function keydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    processEnter(event);
  }
}

/**
 * TODO
 *
 * @param event TODO
 */
function processEnter(event: KeyboardEvent) {
  if (event.shiftKey) {
    TerminalUtil.appendText("\n");
    return;
  }

  console.warn("ENTER PRESSED: '" + TerminalUtil.getUserInput() + "'"); // TODO: Delete this

  const userInput = TerminalUtil.getUserInput();
  CommandUtil.executeCommand(userInput);

  // TODO: Append new prefix
  // TODO: Update readonly index
}
