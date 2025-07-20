import { processEnter } from "./keydown_key/enter.ts";
import { processTab } from "./keydown_key/tab.ts";
import { processArrowUp } from "./keydown_key/arrow_up.ts";
import { processArrowDown } from "./keydown_key/arrow_down.ts";
import { processEnd } from "./keydown_key/end.ts";
import { processHome } from "./keydown_key/home.ts";
import { processA } from "./keydown_key/a.ts";
import { processE } from "./keydown_key/e.ts";

/**
 * Event listener function for handling key down events in the terminal.
 *
 * @param event event listener {@link KeyboardEvent}
 */
export async function keydown(event: KeyboardEvent) {
  type AsyncKeyHandler = (event: KeyboardEvent) => Promise<void>;

  // Requires duplicates for capitalisable keys as per https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#value
  const keyHandlerMap = new Map<string, AsyncKeyHandler>([
    ["a", processA],
    ["A", processA],
    ["ArrowDown", processArrowDown],
    ["ArrowUp", processArrowUp],
    ["e", processE],
    ["E", processE],
    ["End", processEnd],
    ["Enter", processEnter],
    ["Home", processHome],
    ["Tab", processTab],
  ]);

  const handler = keyHandlerMap.get(event.key);
  if (handler) {
    await handler(event);
  }
}
