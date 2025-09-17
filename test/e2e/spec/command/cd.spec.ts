import { expect, test } from "../../fixture";
import {
  COMMAND_RAN_OUTPUT,
  DEFAULT_CURRENT_WORKING_DIRECTORY,
  DEFAULT_HOME_DIRECTORY,
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic";
import { Page } from "@playwright/test";
import {
  assertExactTextInTerminal,
  assertOutputInTerminal,
  getExpectedPrompt,
  runCommand,
} from "../../helper/util/terminal_util";

async function checkCurrentWorkingDirectory(
  page: Page,
  expectedCurrentWorkingDirectory: string,
) {
  const previousOutput = await page.locator(OUTPUT_SELECTOR).textContent();
  const previousPrompt = await page.locator(PROMPT_SELECTOR).textContent();

  const input = "pwd";
  await runCommand(page, input);

  await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
    `${previousOutput}\n${previousPrompt}${input}\n${expectedCurrentWorkingDirectory}`,
  );
  await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
    getExpectedPrompt(expectedCurrentWorkingDirectory),
  );
  await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
}

test.describe("Cd", () => {
  test("should change directory to a given existing directory path when provided that path", async ({
    page,
  }) => {
    // Arrange
    const path = "/colour/dir";
    const input = `cd ${path}`;

    // Act
    await runCommand(page, input);

    // Assert
    await assertExactTextInTerminal(
      page,
      COMMAND_RAN_OUTPUT + input,
      getExpectedPrompt(path),
    );
    await checkCurrentWorkingDirectory(page, path);
  });

  test("should change directory to the home directory when no path is provided", async ({
    page,
  }) => {
    // Arrange
    const input = "cd";

    // Act
    await runCommand(page, input);

    // Assert
    await assertExactTextInTerminal(
      page,
      COMMAND_RAN_OUTPUT + input,
      getExpectedPrompt(DEFAULT_HOME_DIRECTORY),
    );
    await checkCurrentWorkingDirectory(page, DEFAULT_HOME_DIRECTORY);
  });

  test("should change directory to the previous working directory when a previous working directory exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const previousWorkingDirectory = "/colour/dir";

    await runCommand(page, `cd ${previousWorkingDirectory}`);

    // Act
    await runCommand(page, "cd -");

    // Assert
    const expectedOutputText =
      `${DEFAULT_INITIAL_PROMPT}` +
      `\n${DEFAULT_USER_PROMPT}cd ${previousWorkingDirectory}` +
      `\n${getExpectedPrompt(previousWorkingDirectory)}cd -` +
      `\n${DEFAULT_CURRENT_WORKING_DIRECTORY}`;

    await assertExactTextInTerminal(
      page,
      expectedOutputText,
      getExpectedPrompt(DEFAULT_CURRENT_WORKING_DIRECTORY),
    );
    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should change directory to the previous working directory when two previous working directories exist and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const previousWorkingDirectory = "/colour/dir";
    const currentWorkingDirectory = "/src/main/nathanwise";

    await runCommand(page, `cd ${previousWorkingDirectory}`);
    await runCommand(page, `cd ${currentWorkingDirectory}`);

    // Act
    await runCommand(page, "cd -");

    // Assert
    const expectedOutputText =
      `${DEFAULT_INITIAL_PROMPT}` +
      `\n${DEFAULT_USER_PROMPT}cd ${previousWorkingDirectory}` +
      `\n${getExpectedPrompt(previousWorkingDirectory)}cd ${currentWorkingDirectory}` +
      `\n${getExpectedPrompt(currentWorkingDirectory)}cd -` +
      `\n${previousWorkingDirectory}`;

    await assertExactTextInTerminal(
      page,
      expectedOutputText,
      getExpectedPrompt(previousWorkingDirectory),
    );
    await checkCurrentWorkingDirectory(page, previousWorkingDirectory);
  });

  test("should change directory to the previous working directory when multiple previous working directories exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const directories = [
      "/colour/dir",
      "/.foo",
      "/src/main/nathanwise/.empty",
      "/test",
      "/etc",
    ];
    const previousWorkingDirectory = directories[directories.length - 2];
    let previousDirectory = DEFAULT_CURRENT_WORKING_DIRECTORY;

    for (const directory of directories) {
      const previousOutput = await page.locator(OUTPUT_SELECTOR).textContent();

      await runCommand(page, `cd ${directory}`);

      const expectedOutputText = `${previousOutput}\n${getExpectedPrompt(previousDirectory)}cd ${directory}`;
      await assertExactTextInTerminal(
        page,
        expectedOutputText,
        getExpectedPrompt(directory),
      );

      previousDirectory = directory;

      await checkCurrentWorkingDirectory(page, directory);
    }

    const input = "cd -";
    const previousOutput = await page.locator(OUTPUT_SELECTOR).textContent();

    // Act
    await runCommand(page, input);

    // Assert
    const expectedOutputText = `${previousOutput}\n${getExpectedPrompt(previousDirectory)}${input}\n${previousWorkingDirectory}`;
    await assertExactTextInTerminal(
      page,
      expectedOutputText,
      getExpectedPrompt(previousWorkingDirectory),
    );
    await checkCurrentWorkingDirectory(page, previousWorkingDirectory);
  });

  test("should output an error message when multiple paths are provided", async ({
    page,
  }) => {
    // Arrange
    const input = "cd /colour/dir /home/nathanwise";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(
      page,
      `${input}\nbash: cd: too many arguments`,
    );
    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when no previous working directory exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const input = "cd -";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\nbash: cd: OLDPWD not set`);
    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when a file path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "/src/index.ts";
    const input = `cd ${path}`;

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(
      page,
      `${input}\nbash: cd: ${path}: Not a directory`,
    );
    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when a non-existent directory path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "/some/fake/path";
    const input = `cd ${path}`;

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(
      page,
      `${input}\nbash: cd: ${path}: No such file or directory`,
    );
    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when an unresolvable directory path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "~~fakeuser/Desktop";
    const input = `cd ${path}`;

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(
      page,
      `${input}\nbash: cd: ${path}: No such file or directory`,
    );
    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });
});
