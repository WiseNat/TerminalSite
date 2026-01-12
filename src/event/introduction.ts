import TerminalUtil from "../util/terminal_util.ts";
import { random } from "lodash-es";

const INTRODUCTION_STORAGE_KEY = "introductionShown";

/**
 * Event listener function for handling the introductory command typing to help
 * users.
 */
export async function helpUser() {
  if (sessionStorage.getItem(INTRODUCTION_STORAGE_KEY)) {
    return;
  }

  sessionStorage.setItem(INTRODUCTION_STORAGE_KEY, "true");

  const text = "cat ~/help.md";

  for (const char of text) {
    TerminalUtil.appendInput(char);
    await sleep(random(75, 300));
  }

  const inputElement = TerminalUtil.getInputElement();
  triggerEnterKey(inputElement);
}

/**
 * Sleep for `ms` whilst blocking the current thread.
 * @param ms time in milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Dispatch a {@link KeyboardEvent} that acts like the Enter key was pressed.
 * @param element the element the event should be dispatched to.
 */
function triggerEnterKey(element: HTMLElement) {
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(event);
}
