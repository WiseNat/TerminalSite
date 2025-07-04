import { test } from "../../fixture";
import {
  defaultPrompt,
  defaultReadOnly,
  terminalSelector,
} from "../../helper/constant/generic";
import { expectExactTextInTerminal } from "../../helper/util/terminal_util";

test.describe("Echo", () => {
  test("should output all non-option arguments", async ({ page }) => {
    // Arrange
    const input = "echo foo bar -e baz gaz";

    // Act
    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Enter");

    // Assert
    const expected = "foo bar gaz";

    await expectExactTextInTerminal(
      page,
      `${defaultReadOnly}${input}\n${expected}\n${defaultPrompt}`,
    );
  });

  test("should output nothing when nothing is provided", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Enter");

    // Assert
    await expectExactTextInTerminal(
      page,
      `${defaultReadOnly}${input}\n\n${defaultPrompt}`,
    );
  });
});
