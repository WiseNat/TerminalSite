import { test } from "../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../helper/constant/generic";
import {
  ALPHANUMERIC,
  BASIC_SYMBOLS,
  NEWLINES,
  UNICODE_SYMBOLS,
  WHITESPACE,
} from "../helper/constant/charset";
import { expectExactTextInElement } from "../helper/util/terminal_util";
import { simulatePaste } from "../helper/util/clipboard_util";

// TODO: Migrate tests from prevent_readonly_edit into here.
//  - Allowed chars
//  - No inserting newlines (typing or pasting)

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
        await page.locator(inputSelector).pressSequentially(values);

        // Assert
        await expectExactTextInElement(
          page.locator(outputSelector),
          defaultInitialPrompt,
        );
        await expectExactTextInElement(
          page.locator(promptSelector),
          defaultUserPrompt,
        );
        await expectExactTextInElement(page.locator(inputSelector), values);
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
          await page.locator(inputSelector).pressSequentially(char);
        }

        // Assert
        const prompts = `\n${defaultUserPrompt}`.repeat(newlineCounter);

        await expectExactTextInElement(
          page.locator(outputSelector),
          `${defaultInitialPrompt}${prompts}`,
        );
        await expectExactTextInElement(
          page.locator(promptSelector),
          defaultUserPrompt,
        );
        await expectExactTextInElement(page.locator(inputSelector), "");
      });

      test("With Shift can be typed in the user input", async ({ page }) => {
        // Arrange
        let newlineCounter = 0;

        // Act
        for (const char of NEWLINES) {
          newlineCounter++;

          await page.keyboard.down("Shift");
          await page.locator(inputSelector).pressSequentially(char);
          await page.keyboard.up("Shift");
        }

        // Assert
        const newlines = "\n".repeat(newlineCounter);

        await expectExactTextInElement(
          page.locator(outputSelector),
          defaultInitialPrompt,
        );
        await expectExactTextInElement(
          page.locator(promptSelector),
          defaultUserPrompt,
        );

        // A Regular Character is required as most Browsers will obscure Newlines, causing this test to fail, even
        // though it actually passes.
        const character = "a";
        await page.locator(inputSelector).pressSequentially(character);
        await expectExactTextInElement(
          page.locator(inputSelector),
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
      await simulatePaste(page.locator(inputSelector), browser, values);

      // Assert
      await expectExactTextInElement(
        page.locator(outputSelector),
        defaultInitialPrompt,
      );
      await expectExactTextInElement(
        page.locator(promptSelector),
        defaultUserPrompt,
      );
      await expectExactTextInElement(page.locator(inputSelector), values);
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
