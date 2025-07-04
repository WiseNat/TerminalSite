import { test } from "../../fixture";
import { defaultPrompt, terminalSelector } from "../../helper/constant/generic";
import { expectExactTextInTerminal } from "../../helper/util/terminal_util";

test.describe("Clear", () => {
  test("should remove all existing outputs", async ({ page }) => {
    // Arrange
    const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";
    const input = "clear";

    // Act
    // Rubbish input first to simulate terminal usage
    await page.locator(terminalSelector).pressSequentially(defaultInput);
    await page.locator(terminalSelector).press("Enter");

    // Actual clear
    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Enter");

    // Assert
    await expectExactTextInTerminal(page, defaultPrompt);
  });
});
