import { processEnter } from "./enter.ts";
import { processTab } from "./tab.ts";

/**
 * Event listener function for handling key down events in the terminal.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export function keydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    processEnter(event);
  } else if (event.key === "Tab") {
    processTab(event);
  }
}
