import { processEnter } from "./enter.ts";
import { processTab } from "./tab.ts";
import { processArrowUp } from "./arrow_up.ts";
import { processArrowDown } from "./arrow_down.ts";

/**
 * Event listener function for handling key down events in the terminal.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export function keydown(event: KeyboardEvent) {
  switch (event.key) {
    case "Enter":
      processEnter(event);
      break;
    case "Tab":
      processTab(event);
      break;
    case "ArrowUp":
      processArrowUp(event);
      break;
    case "ArrowDown":
      processArrowDown(event);
      break;
  }
}
