import { expect, test } from "../fixture";
import {
  COMMAND_RAN_OUTPUT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../helper/constant/generic.ts";
import { escapeRegExp } from "lodash-es";
import { runCommand } from "../helper/util/terminal_util.ts";

const INTRODUCTION_OUTPUT_IDENTIFIER: RegExp = new RegExp(
  escapeRegExp("Documents/CV.pdf"),
);

test(
  "should cat the ~/help.md file when showing the introduction",
  { tag: "@ShowIntro" },
  async ({ page }) => {
    // Arrange
    const timeout = 5000; // Increased timeout due to slow execution of the introduction

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
      `${COMMAND_RAN_OUTPUT}cat ~/help.md`,
      { timeout: timeout },
    );

    await expect(page.locator(OUTPUT_SELECTOR)).toHaveText(
      INTRODUCTION_OUTPUT_IDENTIFIER,
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

test(
  "should be only be able to type after the introduction concludes",
  { tag: "@ShowIntro" },
  async ({ page }) => {
    // Arrange
    const input = "echo foo";
    const timeout = 5000; // Increased timeout due to slow execution of the introduction

    // Act & Assert
    await runCommand(page, input);

    await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
      `${COMMAND_RAN_OUTPUT}cat ~/help.md`,
      { timeout: timeout },
    ); // Wait for introduction to be done

    await expect(page.locator(OUTPUT_SELECTOR)).not.toContainText(input);
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await runCommand(page, input);
    await expect(page.locator(OUTPUT_SELECTOR)).toContainText(input);
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  },
);
