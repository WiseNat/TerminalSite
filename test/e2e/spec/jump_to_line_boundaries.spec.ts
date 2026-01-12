import { expect, test } from "../fixture";
import { INPUT_SELECTOR } from "../helper/constant/generic";
import { setCaretAtCharIndex } from "../helper/util/terminal_util";

const DEFAULT_INPUT = "foo, bar ?<baz>gaz</baz> asd> // testing";

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
    expectedPosition: 1 + DEFAULT_INPUT.length,
  },
  {
    button: "e",
    withCtrl: true,
    expectedText: "the end of the user input",
    expectedPosition: 1 + DEFAULT_INPUT.length,
  },
  {
    button: "E",
    withCtrl: true,
    expectedText: "the end of the user input",
    expectedPosition: 1 + DEFAULT_INPUT.length,
  },
].forEach(({ button, withCtrl, expectedText, expectedPosition }) => {
  test.describe(`Pressing '${button}'`, () => {
    test.beforeEach(async ({ page }) => {
      await page.locator(INPUT_SELECTOR).pressSequentially(DEFAULT_INPUT);
    });

    [
      {
        type: "at the start of the user input",
        startIndex: 0,
      },
      {
        type: "in the middle of the user input",
        startIndex: Math.floor(DEFAULT_INPUT.length / 2),
      },
      {
        type: "at the end of the user input",
        startIndex: DEFAULT_INPUT.length,
      },
    ].forEach(({ type, startIndex }) => {
      test(`${type} moves the cursor to ${expectedText}`, async ({ page }) => {
        // Arrange
        await setCaretAtCharIndex(page, INPUT_SELECTOR, startIndex);

        // Act
        if (withCtrl) {
          await page.keyboard.down("Control");
        }

        await page.locator(INPUT_SELECTOR).press(button);

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
