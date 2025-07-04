import { Browser, Page } from "@playwright/test";

/**
 * Simulates a paste event by initially copying text using {@link setClipboard}.
 *
 * This *might* have limitations with parallel testing and test isolation.
 *
 * This can hopefully be replaced once Playwright gets official clipboard
 * support. However, this has been an issue since 2020 across a variety of issue
 * tickets and development work seems to have not started - it may be a while
 * before it's implemented. See
 * https://github.com/microsoft/playwright/issues/15860
 *
 * I love the maturity of frontend development.
 *
 * @param page
 * @param browser
 * @param selector
 * @param value
 */
export async function simulatePaste(
  page: Page,
  browser: Browser,
  selector: string,
  value: string,
) {
  await setClipboard(browser, value);

  await page.locator(selector).press("ControlOrMeta+v");
}

/**
 * Reads text from the clipboard.
 * Based on https://github.com/microsoft/playwright/issues/15860#issuecomment-1387470655
 *
 * @param browser current browser
 * @returns clipboard content
 */
export async function getClipboard(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setContent("<textarea id=\"target\"></textarea>");

  const target = page.locator("#target");
  await target.focus();
  await target.press("ControlOrMeta+v");

  const text = await target.inputValue();

  await page.close();

  return text;
}

/**
 * Sets the given value to the clipboard.
 * Based on https://github.com/microsoft/playwright/issues/15860#issuecomment-1387470655
 *
 * @param browser current browser
 * @param value clipboard content to be set
 */
export async function setClipboard(browser: Browser, value: string) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setContent(`<textarea id="target">${value}</textarea>`);

  const target = page.locator("#target");
  await target.selectText();
  await target.press("ControlOrMeta+c");

  await page.close();
}
