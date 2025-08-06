import { Locator, Page } from "@playwright/test";
import { expect } from "../../fixture";
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
 * Checks whether the given element contains the exact provided text.
 *
 * @param locator Playwright's Locator for element
 * @param text the text to check
 */
export async function expectExactTextInElement(locator: Locator, text: string) {
  // Using RegExp in toHaveText to prevent whitespace normalisation
  await expect(locator).toHaveText(new RegExp(`^${_.escapeRegExp(text)}$`));
}

/**
 * Checks whether the given element starts with the provided text.
 *
 * @param locator Playwright's Locator for element
 * @param text the text to check
 */
export async function expectElementToStartWith(locator: Locator, text: string) {
  // Using RegExp in toHaveText to prevent whitespace normalisation
  await expect(locator).toHaveText(new RegExp(`^${_.escapeRegExp(text)}`));
}

/**
 * Checks whether the given element ends with the provided text.
 *
 * @param locator Playwright's Locator for element
 * @param text the text to check
 */
export async function expectElementToEndWith(locator: Locator, text: string) {
  // Using RegExp in toHaveText to prevent whitespace normalisation
  await expect(locator).toHaveText(new RegExp(`${_.escapeRegExp(text)}$`));
}
