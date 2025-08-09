import TerminalUtil from "../../util/terminal_util.ts";
import { zeroWidthSpace } from "../../constant/char.ts";

/**
 * Processes the 'Home' key event. Moves the cursor to the start of the user input.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processHome(event: KeyboardEvent) {
  event.preventDefault();

  if (TerminalUtil.getRawInput().startsWith(zeroWidthSpace)) {
    TerminalUtil.cursorToIndex(1);
  } else {
    TerminalUtil.cursorToIndex(0);
  }
}
