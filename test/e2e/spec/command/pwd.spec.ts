import { test } from "../../fixture";
import { DEFAULT_CURRENT_WORKING_DIRECTORY } from "../../helper/constant/generic";
import {
  assertExactTextInTerminal,
  getExpectedPrompt,
  runCommand,
} from "../../helper/util/terminal_util";

test.describe("Pwd", () => {
  test("should output the current working directory", async ({ page }) => {
    // Arrange
    const input = "pwd";

    // Act
    await runCommand(page, input);

    // Assert
    await assertExactTextInTerminal(
      page,
      `${input}\n${DEFAULT_CURRENT_WORKING_DIRECTORY}`,
    );
  });

  test("should output the changed current working directory when the current working directory is changed", async ({
    page,
  }) => {
    // Arrange
    const changedDirectory = "/usr/local/etc";
    const cdInput = `cd ${changedDirectory}`;
    await runCommand(page, cdInput);

    const input = "pwd";

    // Act
    await runCommand(page, input);

    // Assert
    await assertExactTextInTerminal(
      page,
      `${cdInput}\n${getExpectedPrompt(changedDirectory)}${input}\n${changedDirectory}`,
      undefined,
      getExpectedPrompt(changedDirectory),
    );
  });
});
