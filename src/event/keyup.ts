import TerminalUtil from "../util/terminal_util.ts";
import CommandUtil from "../util/command_util.ts";

/**
 * TODO
 *
 * @param event event listener {@link KeyboardEvent}
 */
export function keyup(event: KeyboardEvent) {
  if (event.key === "Enter") {
    console.warn("ENTER PRESSED: '" + TerminalUtil.getUserInput() + "'"); // TODO: Delete this

    const userInput = TerminalUtil.getUserInput();
    CommandUtil.executeCommand(userInput);

    // TODO: Append new prefix thing
    // TODO: Update readonly index
  }
}
