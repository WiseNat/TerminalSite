import { test } from "../../fixture";
import {
  COMMAND_NOT_FOUND,
  DEFAULT_USER_PROMPT,
} from "../../helper/constant/generic";
import {
  assertExactTextInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Clear", () => {
  test("should remove all existing outputs", async ({ page }) => {
    // Arrange
    const defaultInput = "foo, bar ?<baz>gaz</baz> asd> // testing";
    const input = "clear";

    // Act
    await runCommand(page, defaultInput); // Rubbish input first to simulate terminal usage
    await runCommand(page, input); // actual clear

    // Assert
    await assertExactTextInTerminal(page, "", undefined, "");
  });

  test("output must not have an extra newline after clearing", async ({
    page,
  }) => {
    // Arrange
    const fakeCommand = "fakecommand";

    // Act
    await runCommand(page, "clear");
    await runCommand(page, fakeCommand);

    // Assert
    const fullExpected = `${DEFAULT_USER_PROMPT}${fakeCommand}\n${fakeCommand}${COMMAND_NOT_FOUND}`;
    await assertExactTextInTerminal(page, fullExpected);
  });
});
