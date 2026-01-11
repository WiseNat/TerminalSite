import { expect, test } from "../../fixture";
import {
  assertExactTextInTerminal,
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";
import {
  COMMAND_RAN_OUTPUT,
  DEFAULT_INITIAL_PROMPT,
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic.ts";
import { Page } from "@playwright/test";
import {
  convertHexToRGBACSS,
  convertHexToRGBCSS,
} from "../../helper/util/playwright_util.ts";

const THEME_FLAGS = ["-t", "--theme"];
const FLAVOUR_FLAGS = ["-f", "--flavour"];

test.describe("Terminal", () => {
  ["foo", "bar baz", ""].forEach((args) => {
    test(`should error when no valid flags are provided: ${args}`, async ({
      page,
    }) => {
      // Arrange
      const input = `terminal ${args}`;

      // Act
      await runCommand(page, input);

      // Assert
      const expected =
        "terminal: No flags were provided. Run 'help terminal' for information on how to use this command.";
      await assertOutputInTerminal(page, `${input}\n${expected}`);
    });
  });

  ["-L", "--list"].forEach((flag) => {
    const themesAndFlavours =
      "Themes:\n" +
      "- Classic\n" +
      "- Commodore64\n" +
      "- Dark\n" +
      "- GNOMELikeDark\n" +
      "- GNOMELikeLight\n" +
      "- Light\n" +
      "- SolarizedDark\n" +
      "- SolarizedLight\n" +
      "- TangoDark\n" +
      "- TangoLight\n" +
      "\n" +
      "Shell Flavours:\n" +
      "- MacOS\n" +
      "- Unix\n" +
      "- Windows";

    test.describe(`list flag: ${flag}`, () => {
      test("should list all Themes and Flavours", async ({ page }) => {
        // Arrange
        const input = `terminal ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${themesAndFlavours}`);
      });

      test("should ignore all args when provided and list all Themes and Flavours", async ({
        page,
      }) => {
        // Arrange
        const input = `terminal foo ${flag} bar`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${themesAndFlavours}`);
      });

      THEME_FLAGS.forEach((themeFlag) => {
        test(`should list all Themes and Flavours when provided the list flag and the theme flag (${themeFlag})`, async ({
          page,
        }) => {
          // Arrange
          const theme = "Classic";
          const input = `terminal ${flag} ${themeFlag} ${theme}`;

          // Act
          await runCommand(page, input);

          // Assert
          await assertOutputInTerminal(page, `${input}\n${themesAndFlavours}`);
        });
      });

      FLAVOUR_FLAGS.forEach((flavourFlag) => {
        test(`should list all Themes and Flavours when provided the list flag and the flavour flag (${flavourFlag})`, async ({
          page,
        }) => {
          // Arrange
          const flavour = "Windows";
          const input = `terminal ${flag} ${flavourFlag} ${flavour}`;

          // Act
          await runCommand(page, input);

          // Assert
          await assertOutputInTerminal(page, `${input}\n${themesAndFlavours}`);
        });
      });
    });
  });

  THEME_FLAGS.forEach((flag) => {
    test.describe(`theme flag: ${flag}`, () => {
      interface ThemeProperties {
        entryZero: string;
        entryOne: string;
        entryTwo: string;
        entryThree: string;
        entryFour: string;
        entryFive: string;
        entrySix: string;
        entrySeven: string;
        entryZeroBright: string;
        entryOneBright: string;
        entryTwoBright: string;
        entryThreeBright: string;
        entryFourBright: string;
        entryFiveBright: string;
        entrySixBright: string;
        entrySevenBright: string;
        backgroundColour: string;
        fontFamily: string;
        foregroundColour: string;
        selectionForegroundColour: string;
        selectionBackgroundColour: string;
        externalIconFilter: string;
      }

      /**
       * Retrieve all theme related properties.
       * @param page Playwright page instance.
       */
      async function getThemeProperties(page: Page): Promise<ThemeProperties> {
        return await page.locator(OUTPUT_SELECTOR).evaluate((el) => {
          const style = getComputedStyle(el);

          // prettier-ignore
          return {
            entryZero: style.getPropertyValue("--entry-0"),
            entryOne: style.getPropertyValue("--entry-1"),
            entryTwo: style.getPropertyValue("--entry-2"),
            entryThree: style.getPropertyValue("--entry-3"),
            entryFour: style.getPropertyValue("--entry-4"),
            entryFive: style.getPropertyValue("--entry-5"),
            entrySix: style.getPropertyValue("--entry-6"),
            entrySeven: style.getPropertyValue("--entry-7"),
            entryZeroBright: style.getPropertyValue("--entry-0-bright"),
            entryOneBright: style.getPropertyValue("--entry-1-bright"),
            entryTwoBright: style.getPropertyValue("--entry-2-bright"),
            entryThreeBright: style.getPropertyValue("--entry-3-bright"),
            entryFourBright: style.getPropertyValue("--entry-4-bright"),
            entryFiveBright: style.getPropertyValue("--entry-5-bright"),
            entrySixBright: style.getPropertyValue("--entry-6-bright"),
            entrySevenBright: style.getPropertyValue("--entry-7-bright"),
            backgroundColour: style.getPropertyValue("--background-colour"),
            fontFamily: style.getPropertyValue("--font-family"),
            foregroundColour: style.getPropertyValue("--foreground-colour"),
            selectionForegroundColour: style.getPropertyValue("--selection-foreground-colour"),
            selectionBackgroundColour: style.getPropertyValue("--selection-background-colour"),
            externalIconFilter: style.getPropertyValue("--external-icon-filter"),
          };
        });
      }

      /**
       * Asserts that common Element CSS styling has changed due to a theme.
       * @param page Playwright page instance.
       * @param themeProperties properties after a theme change
       */
      async function assertCommonElementThemeCssChanged(
        page: Page,
        themeProperties: ThemeProperties,
      ) {
        await expect(page.locator(OUTPUT_SELECTOR)).toHaveCSS(
          "background-color",
          convertHexToRGBACSS(themeProperties.backgroundColour),
        );

        await expect(page.locator(OUTPUT_SELECTOR)).toHaveCSS(
          "color",
          convertHexToRGBCSS(themeProperties.foregroundColour),
        );
      }

      test("should change themes when an valid theme is provided", async ({
        page,
      }) => {
        // Arrange
        const theme = "Classic";
        const input = `terminal ${flag} ${theme}`;

        // Act
        const themePropertiesBefore = await getThemeProperties(page);
        await runCommand(page, input);
        const themePropertiesAfter = await getThemeProperties(page);

        // Assert
        const expected = `Changing Terminal Theme to '${theme}'`;
        await assertOutputInTerminal(page, `${input}\n${expected}`);

        expect(themePropertiesBefore).not.toEqual(themePropertiesAfter);
        await assertCommonElementThemeCssChanged(page, themePropertiesAfter);
      });

      test("should do nothing visually when when the existing theme is provided", async ({
        page,
      }) => {
        // Arrange
        const theme = "Classic";
        const input = `terminal ${flag} ${theme}`;
        await runCommand(page, input);

        // Act
        const themePropertiesBefore = await getThemeProperties(page);
        await runCommand(page, input);
        const themePropertiesAfter = await getThemeProperties(page);

        // Assert
        const expected = `Changing Terminal Theme to '${theme}'`;
        await assertOutputInTerminal(
          page,
          `${input}\n${expected}\n${DEFAULT_USER_PROMPT}${input}\n${expected}`,
        );

        expect(themePropertiesBefore).toEqual(themePropertiesAfter);
      });

      test("should error when no theme is provided", async ({ page }) => {
        // Arrange
        const input = `terminal ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected =
          "terminal: No valid Theme was provided. Run 'terminal --list' to view all available Themes";
        await assertOutputInTerminal(page, `${input}\n${expected}`);
      });

      test("should error when an invalid theme is provided", async ({
        page,
      }) => {
        // Arrange
        const theme = "foo";
        const input = `terminal ${flag} ${theme}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected = `terminal: Theme '${theme}' is not valid. Run 'terminal --list' to view all available Themes`;
        await assertOutputInTerminal(page, `${input}\n${expected}`);
      });

      test("theme should persist on reload", async ({ page }) => {
        // Arrange
        const theme = "Classic";
        const input = `terminal ${flag} ${theme}`;

        // Act
        await runCommand(page, input);

        const themePropertiesBefore = await getThemeProperties(page);
        await page.reload();
        const themePropertiesAfter = await getThemeProperties(page);

        // Assert
        expect(themePropertiesBefore).toEqual(themePropertiesAfter);
      });
    });
  });

  FLAVOUR_FLAGS.forEach((flag) => {
    test.describe(`flavour flag: ${flag}`, () => {
      test("should change shell flavour when a valid shell flavour is provided", async ({
        page,
      }) => {
        // Arrange
        const flavour = "Windows";
        const input = `terminal ${flag} ${flavour}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected = `Changing Shell Flavour to '${flavour}'`;
        await assertExactTextInTerminal(
          page,
          `${COMMAND_RAN_OUTPUT}${input}\n${expected}`,
          "C:\\src\\main\\nathanwise>",
        );
      });

      test("should do nothing visually when when the existing flavour is provided", async ({
        page,
      }) => {
        // Arrange
        const flavour = "Unix";
        const input = `terminal ${flag} ${flavour}`;
        await runCommand(page, input);

        // Act
        await runCommand(page, input);

        // Assert
        const expected = `Changing Shell Flavour to '${flavour}'`;
        await assertExactTextInTerminal(
          page,
          `${COMMAND_RAN_OUTPUT}${input}\n${expected}\n${COMMAND_RAN_OUTPUT}${input}\n${expected}`,
          "nathanwise@portfolio:~$ ",
        );
      });

      test("should error when no flavour is provided", async ({ page }) => {
        // Arrange
        const input = `terminal ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected =
          "terminal: No valid Shell Flavour was provided. Run 'terminal --list' to view all available Flavours";
        await assertOutputInTerminal(page, `${input}\n${expected}`);
      });

      test("should error when an invalid flavour is provided", async ({
        page,
      }) => {
        // Arrange
        const flavour = "foo";
        const input = `terminal ${flag} ${flavour}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected = `terminal: Shell Flavour '${flavour}' is not valid. Run 'terminal --list' to view all available Flavours`;
        await assertOutputInTerminal(page, `${input}\n${expected}`);
      });

      test("flavour should persist on reload", async ({ page }) => {
        // Arrange
        const flavour = "Windows";
        const input = `terminal ${flag} ${flavour}`;

        await assertExactTextInTerminal(page, "", DEFAULT_USER_PROMPT);

        // Act
        await runCommand(page, input);
        await page.reload();

        // Assert
        await assertExactTextInTerminal(
          page,
          "Microsoft Windows [Version 10.0.18363.1379]\n" +
            "(c) 2019 Microsoft Corporation. All rights reserved.\n" +
            "\u200B",
          "C:\\src\\main\\nathanwise>",
        );
      });
    });
  });

  test.describe("Autocomplete", () => {
    THEME_FLAGS.forEach((flag) => {
      test.describe(`theme flag: ${flag}`, () => {
        test(`Should autocomplete 'D' arg to 'Dark ', when tab is pressed with 'terminal ${flag} D'`, async ({
          page,
        }) => {
          // Arrange
          const input = `terminal ${flag} D`;

          // Act
          await page.locator(INPUT_SELECTOR).pressSequentially(input);
          await page.locator(INPUT_SELECTOR).press("Tab");

          // Assert
          await assertExactTextInTerminal(
            page,
            DEFAULT_INITIAL_PROMPT,
            undefined,
            `terminal ${flag} Dark `,
          );
        });

        test(`Should autocomplete 'Foo' arg to nothing, when tab is pressed with 'terminal ${flag} Foo'`, async ({
          page,
        }) => {
          // Arrange
          const input = `terminal ${flag} Foo`;

          // Act
          await page.locator(INPUT_SELECTOR).pressSequentially(input);
          await page.locator(INPUT_SELECTOR).press("Tab");

          // Assert
          await assertExactTextInTerminal(
            page,
            DEFAULT_INITIAL_PROMPT,
            undefined,
            input,
          );
        });

        test(`Should provide suggestions for every Theme, when tab is pressed with 'terminal ${flag} '`, async ({
          page,
        }) => {
          // Arrange
          const input = `terminal ${flag} `;
          const flavours = ["Classic", "Dark", "Light"];

          // Act
          await page.locator(INPUT_SELECTOR).pressSequentially(input);
          await page.locator(INPUT_SELECTOR).press("Tab");

          // Assert
          for (const flavour of flavours) {
            await expect(page.locator(OUTPUT_SELECTOR)).toContainText(flavour);
          }
          await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
            DEFAULT_USER_PROMPT,
          );
          await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(input);
        });
      });
    });

    FLAVOUR_FLAGS.forEach((flag) => {
      test.describe(`flavour flag: ${flag}`, () => {
        test(`Should autocomplete 'U' arg to 'Unix ', when tab is pressed with 'terminal ${flag} U'`, async ({
          page,
        }) => {
          // Arrange
          const input = `terminal ${flag} U`;

          // Act
          await page.locator(INPUT_SELECTOR).pressSequentially(input);
          await page.locator(INPUT_SELECTOR).press("Tab");

          // Assert
          await assertExactTextInTerminal(
            page,
            DEFAULT_INITIAL_PROMPT,
            undefined,
            `terminal ${flag} Unix `,
          );
        });

        test(`Should autocomplete 'Foo' arg to nothing, when tab is pressed with 'terminal ${flag} Foo'`, async ({
          page,
        }) => {
          // Arrange
          const input = `terminal ${flag} Foo`;

          // Act
          await page.locator(INPUT_SELECTOR).pressSequentially(input);
          await page.locator(INPUT_SELECTOR).press("Tab");

          // Assert
          await assertExactTextInTerminal(
            page,
            DEFAULT_INITIAL_PROMPT,
            undefined,
            input,
          );
        });

        test(`Should provide suggestions for every Flavour, when tab is pressed with 'terminal ${flag} '`, async ({
          page,
        }) => {
          // Arrange
          const input = `terminal ${flag} `;
          const flavours = ["Unix", "Windows"];

          // Act
          await page.locator(INPUT_SELECTOR).pressSequentially(input);
          await page.locator(INPUT_SELECTOR).press("Tab");

          // Assert
          for (const flavour of flavours) {
            await expect(page.locator(OUTPUT_SELECTOR)).toContainText(flavour);
          }
          await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
            DEFAULT_USER_PROMPT,
          );
          await expect(page.locator(INPUT_SELECTOR)).exactTextInElement(input);
        });
      });
    });
  });
});
