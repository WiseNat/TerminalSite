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
      type: "autocompletes a directory in an implicit relative path",
      input: "Documen",
      expected: "ts/",
    },
    {
      type: "autocompletes a file in an implicit relative path",
      input: "contact.",
      expected: "txt ",
    },
    {
      type: "autocompletes a directory in a long implicit relative path",
      input: "Projects/th",
      expected: "is/",
    },
    {
      type: "autocompletes a file in a long implicit relative path",
      input: "Projects/th",
      expected: "is/",
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
      type: "autocompletes a directory in an explicit relative path",
      input: "./Desk",
      expected: "top/",
    },
    {
      type: "autocompletes a file in an explicit relative path",
      input: "./contact.t",
      expected: "xt ",
    },
    {
      type: "autocompletes a directory in an absolute path that includes a parent directory symbol",
      input: "/home/nathanwise/../nathanwise/Desktop/../../nathan",
      expected: "wise/",
    },
    {
      type: "autocompletes a file in an absolute path that includes a parent directory symbol",
      input: "/home/nathanwise/../nathanwise/Desktop/../../nathanwise/contact",
      expected: ".txt ",
    },
    {
      type: "autocompletes a dot file in an implicit relative path",
      input: "Projects/this/.",
      expected: "external ",
    },
    {
      type: "autocompletes a dot file in an explicit relative path",
      input: "./Projects/this/.",
      expected: "external ",
    },
    {
      type: "autocompletes a dot file in an absolute path",
      input: "/home/nathanwise/Projects/this/.",
      expected: "external ",
    },
    {
      type: "does nothing when trying to autocomplete a space after an implicit relative path",
      input: "Projects ",
      expected: "",
    },
    {
      type: "does nothing when trying to autocomplete a space after an explicit relative path",
      input: "./Projects ",
      expected: "",
    },
    {
      type: "does nothing when trying to autocomplete a space after an absolute path",
      input: "/home/nathanwise/Projects ",
      expected: "",
    },
    {
      type: "does nothing when trying to autocomplete a space after a fake command",
      input: "somefakecommand ",
      expected: "",
    },
  ].forEach(async ({ type, input, expected }) => {
    test(type, async ({ page }) => {
      // Arrange & Act
      await page.locator(inputSelector).pressSequentially(input);
      await page.locator(inputSelector).press("Tab");

      // Assert
      await expect(page.locator(outputSelector)).exactTextInElement(
        defaultInitialPrompt,
      );
      await expect(page.locator(promptSelector)).exactTextInElement(
        defaultUserPrompt,
      );
      await expect(page.locator(inputSelector)).exactTextInElement(
        `${input}${expected}`,
      );
    });
  });
});
