import TerminalUtil from "../../util/terminal_util.ts";
import { ZERO_WIDTH_SPACE } from "../../constant/char.ts";

/**
 * Processes the 'Home' key event. Moves the cursor to the start of the user input.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processHome(event: KeyboardEvent) {
  event.preventDefault();

  if (TerminalUtil.getRawInput().startsWith(ZERO_WIDTH_SPACE)) {
    TerminalUtil.cursorToIndex(1);
  } else {
    TerminalUtil.cursorToIndex(0);
  }

  TerminalUtil.scrollTo("start");
}
