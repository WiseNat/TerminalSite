import { test } from "./fixture";
import {
  expectExactTextInTerminal,
  expectTerminalToStartWithText,
  setCaretAtCharIndex,
} from "./util/terminal_util";
import {
  ALPHANUMERIC,
  BASIC_SYMBOLS,
  UNICODE_SYMBOLS,
  WHITESPACE,
} from "./constant/charset";
import {
  charIndexInReadOnly,
  defaultReadOnly,
  terminalSelector,
} from "./constant/generic";
import { simulatePaste } from "./util/clipboard_util";

const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";

test.beforeEach(async ({ page }) => {
  // TODO: Add HTML
  await page.locator(terminalSelector).pressSequentially(defaultInput);
});

test.describe("Keyboard should not be able to modify the readonly section", () => {
  /*
   * TODO:
   *    - Selected text (Arrow Keys + Modifiers) and Deleting
   *      - Ctrl+X
   *      - Backspace
   *      - Delete
   *    - Undo/Redo
   */

  [
    { type: "alphanumeric characters", values: ALPHANUMERIC },
    { type: "symbols", values: BASIC_SYMBOLS },
    { type: "whitespace characters", values: WHITESPACE }, // TODO: change WHITESPACE to 'SPACE + TAB + NON_BREAKING_SPACE', make INVERTED test for 'NEWLINE + CARRIAGE_RETURN'
    { type: "Unicode symbols", values: UNICODE_SYMBOLS },
  ].forEach(({ type, values }) => {
    test(`when typing ${type} in the readonly section`, async ({ page }) => {
      let insertedChars = "";

      // Set caret to be within the readonly section before typing each character
      for (const char of values) {
        await setCaretAtCharIndex(page, terminalSelector, charIndexInReadOnly);
        await page.locator(terminalSelector).pressSequentially(char);

        // Carriage returns should be treated like newlines
        insertedChars += char.replace("\r", "\n");

        await expectExactTextInTerminal(
          page,
          defaultReadOnly + defaultInput + insertedChars,
        );
      }
    });
  });

  [{ key: "Backspace" }, { key: "Delete" }].forEach(({ key }) => {
    test(`when pressing ${key} in the readonly section`, async ({ page }) => {
      await setCaretAtCharIndex(page, terminalSelector, charIndexInReadOnly);
      await page.locator(terminalSelector).press(key);

      await expectExactTextInTerminal(page, defaultReadOnly + defaultInput);
    });
  });

  [
    { type: "alphanumeric characters", value: ALPHANUMERIC },
    { type: "symbols", value: BASIC_SYMBOLS },
    { type: "Unicode symbols", value: UNICODE_SYMBOLS },
  ].forEach(({ type, value }) => {
    test(`when pasting ${type} in the readonly section`, async ({
      page,
      browser,
    }) => {
      await setCaretAtCharIndex(page, terminalSelector, charIndexInReadOnly);
      await simulatePaste(page, browser, terminalSelector, value);

      await expectExactTextInTerminal(
        page,
        defaultReadOnly + defaultInput + value,
      );
    });
  });

  // Do not merge with the above. Whitespace pasting has no guarantee of being appended due to browser limitations.
  test(`when pasting whitespace in the readonly section`, async ({
    page,
    browser,
  }) => {
    await setCaretAtCharIndex(page, terminalSelector, charIndexInReadOnly);
    await simulatePaste(page, browser, terminalSelector, WHITESPACE);

    await expectTerminalToStartWithText(page, defaultReadOnly + defaultInput);
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
});
