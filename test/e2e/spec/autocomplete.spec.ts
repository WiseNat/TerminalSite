import { expect, test } from "../fixture";
import {
  defaultInitialPrompt,
  defaultUserPrompt,
  inputSelector,
  outputSelector,
  promptSelector,
} from "../helper/constant/generic";

// Custom command specific E2E tests are under each command spec

test.describe("Command autocompletion", () => {
  test("autocompletes 'ech' to 'echo '", async ({ page }) => {
    // Arrange
    const input = "ech";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      defaultInitialPrompt,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement(`${input}o `);
  });

  test("adds a space when 'echo' has been typed", async ({ page }) => {
    // Arrange
    const input = "echo";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      defaultInitialPrompt,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement(`${input} `);
  });

  test("does nothing when no text has been inputted", async ({ page }) => {
    // Arrange & Act
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      defaultInitialPrompt,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement("");
  });
});

test.describe("File/Directory autocompletion", () => {
  test("provides root directories when '/' has been typed", async ({
    page,
  }) => {
    // Arrange
    const input = "/";
    const expectedOutput =
      "bin/\tboot/\tdev/\tetc/\thome/\tlib/\tmedia/\tmnt/\topt/\troot/\trun/\tsbin/\tsrv/\ttmp/\tusr/\tvar/";

    // Act
    await page.locator(inputSelector).pressSequentially(input);
    await page.locator(inputSelector).press("Tab");

    // Assert
    await expect(page.locator(outputSelector)).exactTextInElement(
      `${defaultInitialPrompt}\n${defaultUserPrompt}${input}\n${expectedOutput}`,
    );
    await expect(page.locator(promptSelector)).exactTextInElement(
      defaultUserPrompt,
    );
    await expect(page.locator(inputSelector)).exactTextInElement(input);
  });

  [
    {
      type: "autocompletes a directory in an implicit current working directory path",
      input: "Documen",
      expected: "ts/",
    },
    {
      type: "autocompletes a file in an implicit current working directory path",
      input: "contact.",
      expected: "txt ",
    },
    {
      type: "autocompletes a directory in a path that starts with the home directory symbol",
      input: "~/Desk",
      expected: "top/",
    },
    {
      type: "autocompletes a file in a path that starts with the home directory symbol",
      input: "~/contact.t",
      expected: "xt ",
    },
    {
      type: "autocompletes a directory in a path that starts with the current working directory symbol",
      input: "./Desk",
      expected: "top/",
    },
    {
      type: "autocompletes a file in a path that starts with the current working directory symbol",
      input: "./contact.t",
      expected: "xt ",
    },
    {
      type: "autocompletes a directory in a path that includes a parent directory symbol",
      input: "/home/nathanwise/../nathanwise/Desktop/../../nathan",
      expected: "wise/",
    },
    {
      type: "autocompletes a file in a path that includes a parent directory symbol",
      input: "/home/nathanwise/../nathanwise/Desktop/../../nathanwise/contact",
      expected: ".txt ",
    },
  ].forEach(async ({ type, input, expected }) => {
    test(type, async ({ page }) => {
      // Arrange & Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Tab");

      // Assert
      await expectExactTextInElement(
        page.locator(outputSelector),
        defaultInitialPrompt,
      );
      await expectExactTextInElement(
        page.locator(promptSelector),
        defaultUserPrompt,
      );
      await expectExactTextInElement(
        page.locator(inputSelector),
        `${input}${expected}`,
      );
    });
  });
});
