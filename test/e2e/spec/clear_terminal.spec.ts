import { test } from "../fixture";
import {
  COMMAND_NOT_FOUND,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
} from "../helper/constant/generic";
import {
  assertExactTextInTerminal,
  runCommand,
} from "../helper/util/terminal_util";

["L", "l"].forEach((key) => {
  test.describe(`Clear Terminal: ${key}`, async () => {
    test("should do nothing when L is pressed", async ({ page }) => {
      // Arrange
      const defaultInput = "foo, bar ?bazgazbaz asd> // testing";

      // Act
      await runCommand(page, defaultInput); // Rubbish input first to simulate terminal usage

      await page.locator(INPUT_SELECTOR).press(key);

      // Assert
      // TODO: confirm this is correct
      const fullExpected = `${DEFAULT_USER_PROMPT}${defaultInput}\nfoo,${COMMAND_NOT_FOUND}`;
      await assertExactTextInTerminal(page, fullExpected, undefined, key);
    });

    test("should remove all existing outputs when Ctrl+L is pressed", async ({
      page,
    }) => {
      // Arrange
      const defaultInput = "foo, bar ?bazgazbaz asd> // testing";

      // Act
      await runCommand(page, defaultInput); // Rubbish input first to simulate terminal usage

      await page.keyboard.down("Control");
      await page.locator(INPUT_SELECTOR).press(key);
      await page.keyboard.up("Control");

      // Assert
      await assertExactTextInTerminal(page, "", undefined, "");
    });

    test("output must not have an extra newline after clearing Ctrl+L is pressed", async ({
      page,
    }) => {
      // Arrange
      const fakeCommand = "fakecommand";

      // Act
      await page.keyboard.down("Control");
      await page.locator(INPUT_SELECTOR).press(key);
      await page.keyboard.up("Control");

      await runCommand(page, fakeCommand);

      // Assert
      const fullExpected = `${DEFAULT_USER_PROMPT}${fakeCommand}\n${fakeCommand}${COMMAND_NOT_FOUND}`;
      await assertExactTextInTerminal(page, fullExpected);
    });
  });
});
