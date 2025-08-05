import { test } from "../../fixture";
import {
  defaultUserPrompt,
  defaultInitialPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";
import {
  expectElementToStartWith,
  expectExactTextInElement,
} from "../../helper/util/terminal_util";

test.describe("Echo", () => {
  test("should output all non-option arguments", async ({ page }) => {
    // Arrange
    const input = "echo foo bar -e baz gaz";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    const expected = "foo bar gaz";

    await expectElementToStartWith(
      page.locator(outputSelector),
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expected}`,
    );
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), "");
  });

  test("should output nothing when nothing is provided", async ({ page }) => {
    // Arrange
    const input = "echo ";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expectElementToStartWith(
      page.locator(outputSelector),
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}`,
    );
    await expectExactTextInElement(
      page.locator(promptSelector),
      defaultUserPrompt,
    );
    await expectExactTextInElement(page.locator(inputSelector), "");
  });
});
