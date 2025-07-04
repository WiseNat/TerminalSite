import { Page } from "@playwright/test";
import { expect } from "../../fixture";
import { terminalSelector } from "../constant/generic";
import _ from "lodash";

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

/**
 * Checks whether the terminal contains the exact provided text.
 *
 * @param page Playwright's Page object
 * @param text Exact expected text that the terminal will contain
 */
export async function expectExactTextInTerminal(page: Page, text: string) {
  // Using RegExp in toHaveText to prevent whitespace normalisation
  await expect(page.locator(terminalSelector)).toHaveText(
    new RegExp(`^${_.escapeRegExp(text)}$`),
  );
}

/**
 * Checks whether the terminal starts with the provided text.
 *
 * @param page Playwright's Page object
 * @param text Expected text that the terminal will start with
 */
export async function expectTerminalToStartWithText(page: Page, text: string) {
  // Using RegExp in toHaveText to prevent whitespace normalisation
  await expect(page.locator(terminalSelector)).toHaveText(
    new RegExp(`^${_.escapeRegExp(text)}`),
  );
}
