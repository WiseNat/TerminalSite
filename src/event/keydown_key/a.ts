import { processHome } from "./home.ts";

/**
 * Processes the 'A' key event. Moves the cursor to the start of the user input
 * if 'Ctrl' is also pressed.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function processA(event: KeyboardEvent) {
  if (event.ctrlKey) {
    await processHome(event);
  }
}
