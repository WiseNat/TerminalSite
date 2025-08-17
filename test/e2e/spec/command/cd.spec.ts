import { expect, test } from "../../fixture";
import {
  defaultCurrentWorkingDirectory,
  defaultHomeDirectory,
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../../helper/constant/generic";
import { Page } from "@playwright/test";
import { getExpectedPrompt } from "../../helper/util/terminal_util";

async function checkCurrentWorkingDirectory(
  page: Page,
  expectedCurrentWorkingDirectory: string,
) {
  const previousOutput = await page.locator(outputSelector).textContent();
  const previousPrompt = await page.locator(promptSelector).textContent();

  const pwd = "pwd";
  await page.locator(inputSelector).pressSequentially(pwd);
  await page.locator(inputSelector).press("Enter");

  await expect(page.locator(outputSelector)).elementToStartWith(
    `${previousOutput}\n${previousPrompt}${pwd}\n${expectedCurrentWorkingDirectory}`,
  );
  await expect(page.locator(promptSelector)).exactTextInElement(
    getExpectedPrompt(expectedCurrentWorkingDirectory),
  );
  await expect(page.locator(inputSelector)).exactTextInElement("");
}

test.describe("Cd", () => {
  test("should change directory to a given existing directory path when provided that path", async ({
    page,
  }) => {
    // Arrange
    const path = "/var/tmp";
    const input = `cd ${path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      getExpectedPrompt(path),
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, path);
  });

  test("should change directory to the home directory when no path is provided", async ({
    page,
  }) => {
    // Arrange
    const input = "cd";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      getExpectedPrompt(defaultHomeDirectory),
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, defaultHomeDirectory);
  });

  test("should change directory to the previous working directory when a previous working directory exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const previousWorkingDirectory = "/var/tmp";
    const currentWorkingDirectory = "/home";

    await page
      .locator(inputSelector)
      .pressSequentially(`cd ${previousWorkingDirectory}`);
    await page.locator(inputSelector).press("Enter");

    await page
      .locator(inputSelector)
      .pressSequentially(`cd ${currentWorkingDirectory}`);
    await page.locator(inputSelector).press("Enter");

    // Act
    await page.locator(inputSelector).pressSequentially("cd -");
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}` +
        `\n${defaultUserPrompt}cd ${previousWorkingDirectory}` +
        `\n${getExpectedPrompt(previousWorkingDirectory)}cd ${currentWorkingDirectory}` +
        `\n${getExpectedPrompt(currentWorkingDirectory)}cd -` +
        `\n${previousWorkingDirectory}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      getExpectedPrompt(previousWorkingDirectory),
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

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
    let previousDirectory = defaultCurrentWorkingDirectory;

    for (const directory of directories) {
      const previousOutput = await page.locator(outputSelector).textContent();

      await page.locator(inputSelector).pressSequentially(`cd ${directory}`);
      await page.locator(inputSelector).press("Enter");

      await expect(page.locator(outputSelector)).exactTextInElement(
        `${previousOutput}\n${getExpectedPrompt(previousDirectory)}cd ${directory}`,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        getExpectedPrompt(directory),
      );
      await expect(page.locator(inputSelector)).exactTextInElement("");

      previousDirectory = directory;

      await checkCurrentWorkingDirectory(page, directory);
    }

    const input = "cd -";
    const previousOutput = await page.locator(outputSelector).textContent();

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${previousOutput}\n${getExpectedPrompt(previousDirectory)}${input}\n${previousWorkingDirectory}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      getExpectedPrompt(previousWorkingDirectory),
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, previousWorkingDirectory);
  });

  test("should output an error message when multiple paths are provided", async ({
    page,
  }) => {
    // Arrange
    const input = "cd /var/tmp /home/nathanwise";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\nbash: cd: too many arguments`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, defaultCurrentWorkingDirectory);
  });

  test("should output an error message when no previous working directory exists and '-' is provided as a path", async ({
    page,
  }) => {
    // Arrange
    const input = "cd -";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\nbash: cd: OLDPWD not set`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, defaultCurrentWorkingDirectory);
  });

  test("should output an error message when a file path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "/home/nathanwise/help.txt";
    const input = `cd ${path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\nbash: cd: ${path}: Not a directory`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, defaultCurrentWorkingDirectory);
  });

  test("should output an error message when a non-existent directory path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "/some/fake/path";
    const input = `cd ${path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\nbash: cd: ${path}: No such file or directory`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, defaultCurrentWorkingDirectory);
  });

  test("should output an error message when an unresolvable directory path is provided", async ({
    page,
  }) => {
    // Arrange
    const path = "~~fakeuser/Desktop";
    const input = `cd ${path}`;

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Enter");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\nbash: cd: ${path}: No such file or directory`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");

    await checkCurrentWorkingDirectory(page, defaultCurrentWorkingDirectory);
  });
});
