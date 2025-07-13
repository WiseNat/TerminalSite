import TerminalUtil from "../../util/terminal_util";

/**
 * Processes the 'End' key event. Moves the cursor to the end of the user input.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export function processEnd(event: KeyboardEvent) {
  event.preventDefault();

  TerminalUtil.cursorToEnd();
}
