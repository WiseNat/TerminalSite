import { test } from "../../fixture";
import {
  COMMAND_RAN_OUTPUT,
  DEFAULT_CURRENT_WORKING_DIRECTORY,
} from "../../helper/constant/generic";
import {
  assertExactTextInTerminal,
  assertOutputInTerminal,
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
    await assertOutputInTerminal(
      page,
      `${input}\n${DEFAULT_CURRENT_WORKING_DIRECTORY}`,
    );
  });

  test("should output the changed current working directory when the current working directory is changed", async ({
    page,
  }) => {
    // Arrange
    const changedDirectory = "/some/lengthy/dir";
    const cdInput = `cd ${changedDirectory}`;
    await runCommand(page, cdInput);

    const input = "pwd";

    // Act
    await runCommand(page, input);

    // Assert
    await assertExactTextInTerminal(
      page,
      `${COMMAND_RAN_OUTPUT}${cdInput}\n${getExpectedPrompt(changedDirectory)}${input}\n${changedDirectory}`,
      getExpectedPrompt(changedDirectory),
    );
  });
});
