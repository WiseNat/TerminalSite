import { processEnd } from "./end.ts";

/**
 * Processes the 'E' key event. Moves the cursor to the end of the user input
 * if 'Ctrl' is also pressed.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processE(event: KeyboardEvent) {
  if (event.ctrlKey) {
    await processEnd(event);
  }
}
