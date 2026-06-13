import TerminalUtil from "../../util/terminal_util.ts";

/**
 * Processes the 'L' key event. Clears the current terminal content if 'Ctrl' is
 * also pressed.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processL(event: KeyboardEvent) {
  if (event.ctrlKey) {
    event.preventDefault();
    TerminalUtil.clearTerminal();
  }
}
