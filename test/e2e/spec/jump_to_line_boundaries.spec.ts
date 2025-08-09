import { expect, test } from "../fixture";
import { inputSelector } from "../helper/constant/generic";
import { setCaretAtCharIndex } from "../helper/util/terminal_util";

const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";

// Zero-width Space is present so all positions are +1
[
  {
    button: "Home",
    withCtrl: false,
    expectedText: "the beginning of the user input",
    expectedPosition: 1,
  },
  {
    button: "a",
    withCtrl: true,
    expectedText: "the beginning of the user input",
    expectedPosition: 1,
  },
  {
    button: "A",
    withCtrl: true,
    expectedText: "the beginning of the user input",
    expectedPosition: 1,
  },
  {
    button: "End",
    withCtrl: false,
    expectedText: "the end of the user input",
    expectedPosition: 1 + defaultInput.length,
  },
  {
    button: "e",
    withCtrl: true,
    expectedText: "the end of the user input",
    expectedPosition: 1 + defaultInput.length,
  },
  {
    button: "E",
    withCtrl: true,
    expectedText: "the end of the user input",
    expectedPosition: 1 + defaultInput.length,
  },
].forEach(({ button, withCtrl, expectedText, expectedPosition }) => {
  test.describe(`Pressing '${button}'`, () => {
    test.beforeEach(async ({ page }) => {
      await page.locator(inputSelector).pressSequentially(defaultInput);
    });

    [
      {
        type: "at the start of the user input",
        startIndex: 0,
      },
      {
        type: "in the middle of the user input",
        startIndex: Math.floor(defaultInput.length / 2),
      },
      {
        type: "at the end of the user input",
        startIndex: defaultInput.length,
      },
    ].forEach(({ type, startIndex }) => {
      test(`${type} moves the cursor to ${expectedText}`, async ({ page }) => {
        // Arrange
        await setCaretAtCharIndex(page, inputSelector, startIndex);

        // Act
        if (withCtrl) {
          await page.keyboard.down("Control");
        }

        await page.locator(inputSelector).press(button);

        if (withCtrl) {
          await page.keyboard.up("Control");
        }

        // Assert
        const caretPos = await page.evaluate(() => {
          const selection = window.getSelection();

          if (!selection || selection.rangeCount === 0) {
            return null;
          }

          return selection.getRangeAt(0).startOffset;
        });

        expect(caretPos).toBeDefined();
        expect(caretPos).toStrictEqual(expectedPosition);
      });
    });
  });
});
