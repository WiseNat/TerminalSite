import { expect, test } from "../../fixture";
import {
  DEFAULT_CURRENT_WORKING_DIRECTORY,
  DEFAULT_HOME_DIRECTORY,
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic";
import { Page } from "@playwright/test";
import { getExpectedPrompt } from "../../helper/util/terminal_util";

async function checkCurrentWorkingDirectory(
  page: Page,
  expectedCurrentWorkingDirectory: string,
) {
  const previousOutput = await page.locator(OUTPUT_SELECTOR).textContent();
  const previousPrompt = await page.locator(PROMPT_SELECTOR).textContent();

  const pwd = "pwd";
  await page.locator(INPUT_SELECTOR).pressSequentially(pwd);
  await page.locator(INPUT_SELECTOR).press("Enter");

  await expect(page.locator(OUTPUT_SELECTOR)).elementToStartWith(
    `${previousOutput}\n${previousPrompt}${pwd}\n${expectedCurrentWorkingDirectory}`,
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
    const path = "/var/tmp";
    const input = `cd ${path}`;

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      getExpectedPrompt(path),
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, path);
  });

  test("should change directory to the home directory when no path is provided", async ({
    page,
  }) => {
    // Arrange
    const input = "cd";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      getExpectedPrompt(DEFAULT_HOME_DIRECTORY),
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, DEFAULT_HOME_DIRECTORY);
  });

  test("should change directory to the previous working directory when a previous working directory exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const previousWorkingDirectory = "/var/tmp";
    const currentWorkingDirectory = "/home";

    await page
      .locator(INPUT_SELECTOR)
      .pressSequentially(`cd ${previousWorkingDirectory}`);
    await page.locator(INPUT_SELECTOR).press("Enter");

    await page
      .locator(INPUT_SELECTOR)
      .pressSequentially(`cd ${currentWorkingDirectory}`);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially("cd -");
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}` +
        `\n${DEFAULT_USER_PROMPT}cd ${previousWorkingDirectory}` +
        `\n${getExpectedPrompt(previousWorkingDirectory)}cd ${currentWorkingDirectory}` +
        `\n${getExpectedPrompt(currentWorkingDirectory)}cd -` +
        `\n${previousWorkingDirectory}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      getExpectedPrompt(previousWorkingDirectory),
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, previousWorkingDirectory);
  });

  test("should change directory to the previous working directory when multiple previous working directories exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const directories = [
      "/var/tmp",
      "/home",
      "/usr/lib",
      "/home/nathanwise/Music",
      "/etc/opt",
    ];
    const previousWorkingDirectory = directories[directories.length - 2];
    let previousDirectory = DEFAULT_CURRENT_WORKING_DIRECTORY;

    for (const directory of directories) {
      const previousOutput = await page.locator(OUTPUT_SELECTOR).textContent();

      await page.locator(INPUT_SELECTOR).pressSequentially(`cd ${directory}`);
      await page.locator(INPUT_SELECTOR).press("Enter");

      await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
        `${previousOutput}\n${getExpectedPrompt(previousDirectory)}cd ${directory}`,
      );
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        getExpectedPrompt(directory),
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

      previousDirectory = directory;

      await checkCurrentWorkingDirectory(page, directory);
    }

    const input = "cd -";
    const previousOutput = await page.locator(OUTPUT_SELECTOR).textContent();

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${previousOutput}\n${getExpectedPrompt(previousDirectory)}${input}\n${previousWorkingDirectory}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      getExpectedPrompt(previousWorkingDirectory),
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, previousWorkingDirectory);
  });

  test("should output an error message when multiple paths are provided", async ({
    page,
  }) => {
    // Arrange
    const input = "cd /var/tmp /home/nathanwise";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\nbash: cd: too many arguments`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when no previous working directory exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const input = "cd -";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\nbash: cd: OLDPWD not set`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when a file path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "/home/nathanwise/help.txt";
    const input = `cd ${path}`;

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\nbash: cd: ${path}: Not a directory`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when a non-existent directory path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "/some/fake/path";
    const input = `cd ${path}`;

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\nbash: cd: ${path}: No such file or directory`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });

  test("should output an error message when an unresolvable directory path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "~~fakeuser/Desktop";
    const input = `cd ${path}`;

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Enter");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\nbash: cd: ${path}: No such file or directory`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, DEFAULT_CURRENT_WORKING_DIRECTORY);
  });
});
