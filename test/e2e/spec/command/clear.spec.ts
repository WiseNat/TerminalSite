import { test } from "../../fixture";
import {
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";
import { expectExactTextInElement } from "../../helper/util/terminal_util";

test.describe("Clear", () => {
  test("should remove all existing outputs", async ({ page }) => {
    // Arrange
    const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";
    const input = "clear";

    // Act
    // Rubbish input first to simulate terminal usage
    await page.locator(inputSelector).pressSequentially(defaultInput);
    await page.locator(inputSelector).press("Enter");

    // Actual clear
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expectExactTextInElement(page.locator(outputSelector), "");
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), "");
  });
});
