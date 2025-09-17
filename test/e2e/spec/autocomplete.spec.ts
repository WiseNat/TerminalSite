import { expect, test } from "../fixture";
import {
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../helper/constant/generic";

// Custom command specific E2E tests are under each command spec

test.describe("Command autocompletion", () => {
  test("autocompletes 'ech' to 'echo '", async ({ page }) => {
    // Arrange
    const input = "ech";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Tab");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      DEFAULT_INITIAL_PROMPT,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(`${input}o `);
  });

  test("adds a space when 'echo' has been typed", async ({ page }) => {
    // Arrange
    const input = "echo";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Tab");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      DEFAULT_INITIAL_PROMPT,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(`${input} `);
  });

  test("does nothing when no text has been inputted", async ({ page }) => {
    // Arrange & Act
    await page.locator(INPUT_SELECTOR).press("Tab");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      DEFAULT_INITIAL_PROMPT,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });
});

test.describe("File/Directory autocompletion", () => {
  test("provides root directories when '/' has been typed", async ({
    page,
  }) => {
    // Arrange
    const input = "/";
    const expectedOutput = ".foo/\tcolour/\tetc/\tsome/\tsrc/\ttest/";

    // Act
    await page.locator(INPUT_SELECTOR).pressSequentially(input);
    await page.locator(INPUT_SELECTOR).press("Tab");

    // Assert
    await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
      `${DEFAULT_INITIAL_PROMPT}\n${DEFAULT_USER_PROMPT}${input}\n${expectedOutput}`,
    );
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(input);
  });

  [
    {
      type: "autocompletes a directory in an implicit relative path",
      input: "Desk",
      expected: "top/",
    },
    {
      type: "autocompletes a file in an implicit relative path",
      input: "newlines.",
      expected: "txt ",
    },
    {
      type: "autocompletes a directory in a long implicit relative path",
      input: ".full/some",
      expected: "EmptyDir/",
    },
    {
      type: "autocompletes a file in a long implicit relative path",
      input: "foo/baz",
      expected: "zing.gaz ",
    },
    {
      type: "autocompletes a directory in a path that starts with the home directory symbol",
      input: "~/Desk",
      expected: "top/",
    },
    {
      type: "autocompletes a file in a path that starts with the home directory symbol",
      input: "~/external/rep",
      expected: "o.md ",
    },
    {
      type: "autocompletes a directory in an explicit relative path",
      input: "./Desk",
      expected: "top/",
    },
    {
      type: "autocompletes a file in an explicit relative path",
      input: "./newlines.t",
      expected: "xt ",
    },
    {
      type: "autocompletes a directory in an absolute path that includes a parent directory symbol",
      input: "/src/main/nathanwise/../nathanwise/Desktop/../../nathan",
      expected: "wise/",
    },
    {
      type: "autocompletes a file in an absolute path that includes a parent directory symbol",
      input: "/src/main/nathanwise/../nathanwise/Desktop/../../nathanwise/some",
      expected: "_rubbish.tmp ",
    },
    {
      type: "autocompletes a dot file in an implicit relative path",
      input: ".test",
      expected: "ing ",
    },
    {
      type: "autocompletes a dot file in an explicit relative path",
      input: "./.test",
      expected: "ing ",
    },
    {
      type: "autocompletes a dot file in an absolute path",
      input: "/src/main/nathanwise/.b",
      expected: "ashrc ",
    },
    {
      type: "does nothing when trying to autocomplete a space after an implicit relative path",
      input: "external ",
      expected: "",
    },
    {
      type: "does nothing when trying to autocomplete a space after an explicit relative path",
      input: "./external ",
      expected: "",
    },
    {
      type: "does nothing when trying to autocomplete a space after an absolute path",
      input: "/src/main/nathanwise/external ",
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
      await page.locator(INPUT_SELECTOR).pressSequentially(input);
      await page.locator(INPUT_SELECTOR).press("Tab");

      // Assert
      await expect(page.locator(OUTPUT_SELECTOR)).exactTextInElement(
        DEFAULT_INITIAL_PROMPT,
      );
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(
        `${input}${expected}`,
      );
    });
  });
});
