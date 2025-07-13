import { expect, test } from "../fixture";
import {
  charIndexInReadOnly,
  defaultReadOnly,
  terminalSelector,
} from "../helper/constant/generic";
import { setCaretAtCharIndex } from "../helper/util/terminal_util";

const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";

[
  {
    button: "Home",
    expectedText: "the beginning of the user input",
    expectedPosition: defaultReadOnly.length,
  },
  {
    button: "End",
    expectedText: "the end of the user input",
    expectedPosition: defaultReadOnly.length + defaultInput.length,
  },
].forEach(({ button, expectedText, expectedPosition }) => {
  test.describe(`Pressing '${button}'`, () => {
    test.beforeEach(async ({ page }) => {
      await page.locator(terminalSelector).pressSequentially(defaultInput);
    });

    [
      { type: "in the readonly section", startIndex: charIndexInReadOnly },
      {
        type: "at the start of the user input",
        startIndex: defaultReadOnly.length,
      },
      {
        type: "in the middle of the user input",
        startIndex: defaultReadOnly.length + 3,
      },
      {
        type: "at the end of the user input",
        startIndex: defaultReadOnly.length + defaultInput.length,
      },
    ].forEach(({ type, startIndex }) => {
      test(`${type} moves the cursor to ${expectedText}`, async ({ page }) => {
        // Arrange
        await setCaretAtCharIndex(page, terminalSelector, startIndex);

        // Act
        await page.locator(terminalSelector).press(button);

        // Assert
        const caretPos = await page.evaluate(() => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return null;
          return selection.getRangeAt(0).startOffset;
        });

        expect(caretPos).toBeDefined();
        expect(caretPos).toStrictEqual(expectedPosition);
      });
    });
  });
});
