import { processEnter } from "./keydown_key/enter.ts";
import { processTab } from "./keydown_key/tab.ts";
import { processArrowUp } from "./keydown_key/arrow_up.ts";
import { processArrowDown } from "./keydown_key/arrow_down.ts";
import { processEnd } from "./keydown_key/end.ts";

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
    case "End":
      processEnd(event);
      break;
  }
}
