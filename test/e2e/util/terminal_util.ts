import { Page } from "@playwright/test";
import { expect } from "../fixture";
import { terminalSelector } from "../constant/generic";
import _ from "lodash";

// TODO: Refactor to meet my standards
// TODO: Rewrite JSDoc

/**
 * Places the caret inside a contenteditable element at a given character index.
 *
 * @param page - Playwright's Page object
 * @param selector - CSS selector for the contenteditable element
 * @param charIndex - Character offset where the caret should be placed
 */
export async function setCaretAtCharIndex(
  page: Page,
  selector: string,
  charIndex: number,
) {
  await page.evaluate(
    ({ selector, charIndex }) => {
      const el = document.querySelector(selector)!;
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE)
        throw new Error("No text node found inside element");

      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(textNode, charIndex);
      range.collapse(true);

      selection?.removeAllRanges();
      selection?.addRange(range);
    },
    { selector, charIndex },
  );
}

// TODO: JSDoc
export async function expectExactTextInTerminal(page: Page, text: string) {
  // Using RegExp in toHaveText to prevent whitespace normalisation
  await expect(page.locator(terminalSelector)).toHaveText(
    new RegExp(`^${_.escapeRegExp(text)}$`),
  );
}
