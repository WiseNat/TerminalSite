import { expect, test } from "../../fixture";
import { runCommand } from "../../helper/util/terminal_util.ts";
import {
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic.ts";

test.describe("Reboot", () => {
  test("should refresh the page", async ({ page }) => {
    // Arrange
    const input = "reboot";

    // Act
    await Promise.all([
      page.waitForEvent("framenavigated", { timeout: 5000 }),
      await runCommand(page, input),
    ]);

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      DEFAULT_INITIAL_PROMPT,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });
});
