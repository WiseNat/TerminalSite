import { expect, test } from "../fixture";
import {
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../helper/constant/generic";
import {
  ALPHANUMERIC,
  BASIC_SYMBOLS,
  NEWLINES,
  UNICODE_SYMBOLS,
  WHITESPACE,
} from "../helper/constant/charset";
import { simulatePaste } from "../helper/util/clipboard_util";

test.describe("Keyboard", () => {
  /*
   * TODO:
   *    - Selected text (Arrow Keys + Modifiers) and Deleting
   *      - Ctrl+X
   *      - Backspace
   *      - Delete
   *    - Undo/Redo
   */

  test.describe("typing", () => {
    [
      { type: "alphanumeric characters", values: ALPHANUMERIC },
      { type: "symbols", values: BASIC_SYMBOLS },
      { type: "whitespace characters", values: WHITESPACE },
      { type: "Unicode symbols", values: UNICODE_SYMBOLS },
    ].forEach(({ type, values }) => {
      test(`${type} are able to be typed in the user input`, async ({
        page,
      }) => {
        // Arrange & Act
        await page.locator(INPUT_SELECTOR).pressSequentially(values);

        // Assert
        await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
          DEFAULT_INITIAL_PROMPT,
        );
        await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
          DEFAULT_USER_PROMPT,
        );
        await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(values);
      });
    });

    test.describe("Newlines", () => {
      test("Normally are not able to be typed in the user input", async ({
        page,
      }) => {
        // Arrange
        let newlineCounter = 0;

        // Act
        for (const char of NEWLINES) {
          newlineCounter++;
          await page.locator(INPUT_SELECTOR).pressSequentially(char);
        }

        // Assert
        const prompts = `\n${DEFAULT_USER_PROMPT}`.repeat(newlineCounter);

        await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
          `${DEFAULT_INITIAL_PROMPT}${prompts}`,
        );
        await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
          DEFAULT_USER_PROMPT,
        );
        await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
      });

      test("With Shift can be typed in the user input", async ({ page }) => {
        // Arrange
        let newlineCounter = 0;

        // Act
        for (const char of NEWLINES) {
          newlineCounter++;

          await page.keyboard.down("Shift");
          await page.locator(INPUT_SELECTOR).pressSequentially(char);
          await page.keyboard.up("Shift");
        }

        // Assert
        const newlines = "\n".repeat(newlineCounter);

        await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
          DEFAULT_INITIAL_PROMPT,
        );
        await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
          DEFAULT_USER_PROMPT,
        );

        // A Regular Character is required as most Browsers will obscure Newlines, causing this test to fail, even
        // though it actually passes.
        const character = "a";
        await page.locator(INPUT_SELECTOR).pressSequentially(character);
        await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
          newlines + character,
        );
      });
    });
  });

  [
    { type: "alphanumeric characters", values: ALPHANUMERIC },
    { type: "symbols", values: BASIC_SYMBOLS },
    { type: "whitespace characters", values: WHITESPACE },
    { type: "Unicode symbols", values: UNICODE_SYMBOLS },
    // Newlines must be tested manually. Browsers do not play ball when testing user-inserts of these
  ].forEach(({ type, values }) => {
    test(`${type} are able to be pasted in the user input`, async ({
      page,
      browser,
    }) => {
      // Arrange & Act
      await simulatePaste(page.locator(INPUT_SELECTOR), browser, values);

      // Assert
      await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
        DEFAULT_INITIAL_PROMPT,
      );
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(values);
    });
  });
});

/*
 * TODO: the following tests are currently not possible, implement later if Playwright provides support for them
 *  - Dragging Text
 *      - ? to readonly
 *      - ? to input
 *      - readonly to readonly
 *      - input to readonly
 *      - readonly to input
 *      - input to input
 *  - Context Menu
 *      - Cut
 *      - Copy
 *      - Paste
 *  - Dragging non-text
 *      - Image
 *      - File
 *      - Video
 */
