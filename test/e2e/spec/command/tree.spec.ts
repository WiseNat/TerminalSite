import { expect, test } from "../../fixture";
import {
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";

test.describe("Tree", () => {
  // TODO; test cases:
  //  - [/] No arg, generate CWD tree (UNIT TEST ONLY FUCK DOING THAT IN E2E)!!!
  //  - [/] Arg, generate tree

  test("TODO!", async ({ page }) => {
    // Arrange
    const input = "tree";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement("");
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });
});
