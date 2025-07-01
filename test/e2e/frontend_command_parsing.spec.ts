import { test } from "./fixture";
import {
  charIndexInReadOnly,
  commandNotFound,
  defaultPrompt,
  defaultReadOnly,
  terminalSelector,
} from "./constant/generic";
import {
  expectExactTextInTerminal,
  setCaretAtCharIndex,
} from "./util/terminal_util";

test("Typing a valid command and pressing Enter runs that command", async ({
  page,
}) => {
  const commandName = "echo";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  await page.locator(terminalSelector).pressSequentially(input);
  await page.locator(terminalSelector).press("Enter");

  await expectExactTextInTerminal(
    page,
    defaultReadOnly +
      input +
      "\n" +
      commandArgs.join(" ") +
      "\n" +
      defaultPrompt,
  );
});

test("Typing an unknown command and pressing Enter returns that the command was not found", async ({
  page,
}) => {
  const commandName = "fakecommandthatdoesnotexist";
  const commandArgs = ["foo", "bar"];
  const input = commandName + " " + commandArgs.join(" ");

  await page.locator(terminalSelector).pressSequentially(input);
  await page.locator(terminalSelector).press("Enter");

  await expectExactTextInTerminal(
    page,
    defaultReadOnly +
      input +
      "\n" +
      commandName +
      commandNotFound +
      "\n" +
      defaultPrompt,
  );
});

test("Typing no command and pressing Enter does nothing", async ({ page }) => {
  await page.locator(terminalSelector).press("Enter");

  await expectExactTextInTerminal(page, defaultReadOnly + "\n" + defaultPrompt);
});

[{ type: "readonly" }, { type: "user input" }].forEach(({ type }) => {
  test(`Pressing Enter should run a command & should prevent a newline being inputted in the ${type} section`, async ({
    page,
  }) => {
    const commandName = "fakecommandthatdoesnotexist";
    const commandArgs = ["foo", "bar"];
    const input = commandName + " " + commandArgs.join(" ");

    if (type === "readonly") {
      await setCaretAtCharIndex(page, terminalSelector, charIndexInReadOnly);
    }

    await page.locator(terminalSelector).pressSequentially(input);
    await page.locator(terminalSelector).press("Enter");

    await expectExactTextInTerminal(
      page,
      defaultReadOnly +
        input +
        "\n" +
        commandName +
        commandNotFound +
        "\n" +
        defaultPrompt,
    );
  });
});

[{ type: "readonly" }, { type: "user input" }].forEach(({ type }) => {
  test(`Pressing Shift+Enter should not run a command & should insert a newline in the ${type} section`, async ({
    page,
  }) => {
    const commandName = "fakecommandthatdoesnotexist";
    const commandArgs = ["foo", "bar"];
    const input = commandName + " " + commandArgs.join(" ");

    if (type === "readonly") {
      await setCaretAtCharIndex(page, terminalSelector, charIndexInReadOnly);
    }

    await page.locator(terminalSelector).pressSequentially(input);
    await page.keyboard.down("Shift");
    await page.locator(terminalSelector).press("Enter");
    await page.keyboard.up("Shift");

    await expectExactTextInTerminal(page, defaultReadOnly + input + "\n");
  });
});
