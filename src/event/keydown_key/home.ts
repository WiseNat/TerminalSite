import TerminalUtil from "../../util/terminal_util.ts";

/**
 * Processes the 'Home' key event. Moves the cursor to the start of the user input.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processHome(event: KeyboardEvent) {
  event.preventDefault();

  const textLength = TerminalUtil.getReadOnlyContent().length;
  TerminalUtil.cursorToIndex(textLength);
}
