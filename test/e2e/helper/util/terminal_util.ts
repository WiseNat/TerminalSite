import { Page } from "@playwright/test";
import {
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../constant/generic.ts";
import { expect } from "../../fixture.ts";

/**
 * Places the caret inside a contenteditable element at a given character index.
 *
 * @param page Playwright's Page object
 * @param selector CSS selector for the contenteditable element
 * @param charIndex Character offset where the caret should be placed
 */
export async function setCaretAtCharIndex(
  page: Page,
  selector: string,
  charIndex: number,
) {
  await page.evaluate(
    ({ selector, charIndex }) => {
      const element = document.querySelector(selector)!;
      const textNode = element.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE)
        throw new Error("No text node found inside element");

      const range = document.createRange();
      range.setStart(textNode, charIndex);
      range.collapse(true);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    },
    { selector, charIndex },
  );
}

export function getExpectedPrompt(path: string) {
  const splitPath = path.split("/").filter(Boolean);
  return `C:\\${splitPath.join("\\")}>`;
}

/**
 * Runs a command in the Terminal.
 *
 * @param page Playwright page instance.
 * @param command the command and args to run.
 */
export async function runCommand(page: Page, command: string) {
  await page.locator(INPUT_SELECTOR).pressSequentially(command);
  await page.locator(INPUT_SELECTOR).press("Enter");
}

/**
 * Asserts that there is exact text in the Terminal.
 * <p>
 * Acts as a helper method for common assert logic. Can be used in one of two ways..
 * @example
 * // Generic example for when the output, prompt, and input remain standard
 * const input = "echo foo bar";
 * const expected = "\nfoo bar";
 * await assertExactTextInTerminal(page, `${input}${expected}`);
 *
 * // Example for when the prompt changes from the norm
 * const input = "cd ~/Desktop";
 * const expectedPrompt = "";
 * await assertExactTextInTerminal(page, "", undefined, getExpectedPrompt("/home/nathanwise/Desktop"));
 *
 * // Example for when the output changes from the norm
 * const input = "clear";
 * await assertExactTextInTerminal(page, "", "");
 *
 * @param page Playwright page instance.
 * @param expectedOutput the expected output to append to the default `outputText`.
 * @param outputText the expected output, leave undefined for the default value if you're planning on relying on `expectedOutput`.
 * @param promptText the expected prompt, leave undefined to default to {@link DEFAULT_USER_PROMPT}.
 * @param inputText the expected input, leave undefined to default to an empty string.
 */
export async function assertExactTextInTerminal(
  page: Page,
  expectedOutput: string,
  outputText?: string,
  promptText?: string,
  inputText?: string,
) {
  outputText ??= `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${expectedOutput}`;
  promptText ??= DEFAULT_USER_PROMPT;
  inputText ??= "";

  await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(outputText);
  await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(promptText);
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(inputText);
}
