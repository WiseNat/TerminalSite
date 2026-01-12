import { expect, test } from "../fixture";
import {
  COMMAND_RAN_OUTPUT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../helper/constant/generic.ts";
import { escapeRegExp } from "lodash-es";

test(
  "should cat the ~/help.md file when showing the introduction",
  { tag: "@ShowIntro" },
  async ({ page }) => {
    // Arrange
    const timeout = 5000; // Increased timeout due to slow execution of the introduction

    const helpFileContentsIdentifier: RegExp = new RegExp(
      escapeRegExp("Documents/CV.pdf"),
    );

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
      `${COMMAND_RAN_OUTPUT}cat ~/help.md`,
      { timeout: timeout },
    );

    await expect(page.locator(OUTPUT_SELECTOR)).toHaveText(
      helpFileContentsIdentifier,
    );

    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
      { timeout: timeout },
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("", {
      timeout: timeout,
    });
  },
);
