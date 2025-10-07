import { expect, test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";
import {
  DEFAULT_USER_PROMPT,
  INPUT_SELECTOR,
  OUTPUT_SELECTOR,
  PROMPT_SELECTOR,
} from "../../helper/constant/generic.ts";
import { escapeRegExp } from "lodash-es";

test.describe("Neofetch", () => {
  test("Should show a logo and system information when no flags are provided", async ({
    page,
  }) => {
    // Arrange
    const input = "neofetch";

    // Act
    await runCommand(page, input);

    // Assert
    const expectedRegexes: RegExp[] = [
      new RegExp(
        escapeRegExp("`+-----------_`+------------+`_-----------+`") +
          "   " +
          "nathanwise@nathan-wise-portfolio",
        "g",
      ),
      new RegExp(
        escapeRegExp("*$$$$$$$$$$$$B<%$$$$$$$$$$$$8<@$$$$$$$$$$$$*") +
          "   " +
          "------------",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$$$$$$$@i%$$$$$$$$$$$$%i@$$$$$$$$$$$$$") +
          "   " +
          "OS: .*",
        "g",
      ),
      new RegExp(
        escapeRegExp("YYYYYYYYXYYYYz>cYYYYYYYYYYYYc>zYYYYYYYYYYYYY") +
          "   " +
          "Host: Unknown",
        "g",
      ),
      new RegExp(
        escapeRegExp("######*W&#*##M8M############M8M#############") +
          "   " +
          "Kernel: .*",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$&a$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
          "   " +
          "Uptime: .*",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$*|^ ~Q$$$@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
          "   " +
          "Shell: terminal-site 2\\.0",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$b!    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
          "   " +
          "Resolution: \\d+x\\d+",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$O~    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
          "   " +
          "DE: .*",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$$$0-`   +L%$$$$$$$$$$$$$$$$$$$$$$$$$$") +
          "   " +
          "WM: .*",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$@$$hl '  ^k$$$$@@@@@@@@@@@@@@@$$$$$$$") +
          "   " +
          "Terminal: terminal-site",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$$k1.   :v8$$$$$$$$$$$$$$$$$$$$$$$$$$$") +
          "   " +
          "CPU: Unknown \\(\\d+\\) @ \\?GHz",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$h(.   :u&$$$$$$dQ0QQQQQQQQQQQ00#$$$$$$") +
          "   " +
          "GPU: Unknown",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$w    :v8$$@$$$$@^               ($@$$$$") +
          "   " +
          "Memory: (?:\\?\\d*|\\d+)B \\/ (?:\\?\\d*|\\d+)B",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$@q}iv8$$@$$$$$$$-:::::::::::::;:v$@$$$$") +
          "   " +
          "",
        "g",
      ),
      new RegExp(
        escapeRegExp("$$$$$$$$$$$@$$$$$$$$$@%%%%%%%%%%%%%%%$$$$$$$") +
          "   " +
          "                        ",
        "g",
      ),
      new RegExp(
        escapeRegExp("*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*") +
          "   " +
          "                        ",
        "g",
      ),
      new RegExp(
        escapeRegExp("`+--------------------_______________-----+"),
        "g",
      ),
      /\n\n $/gm,
    ];

    for (const expectedRegex of expectedRegexes) {
      await expect(page.locator(OUTPUT_SELECTOR)).toHaveText(expectedRegex);
    }
    await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
      DEFAULT_USER_PROMPT,
    );
    await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
  });

  test.describe("off flag: --off", () => {
    test("Should show no logo and the system information when the --off flag is provided", async ({
      page,
    }) => {
      // Arrange
      const input = "neofetch --off";

      // Act
      await runCommand(page, input);

      // Assert
      const expectedRegex: RegExp =
        /^nathanwise@nathan-wise-portfolio\n------------\nOS: .*\nHost: Unknown\nKernel: .*\nUptime: .*\nShell: terminal-site 2\.0\nResolution: \d+x\d+\nDE: .*\nWM: .*\nTerminal: terminal-site\nCPU: Unknown \(\d+\) @ \?GHz\nGPU: Unknown\nMemory: (?:\?\d*|\d+)B \/ (?:\?\d*|\d+)B/gm;

      await expect(page.locator(OUTPUT_SELECTOR)).toHaveText(expectedRegex);
      await expect(page.locator(PROMPT_SELECTOR)).exactTextInElement(
        DEFAULT_USER_PROMPT,
      );
      await expect(page.locator(INPUT_SELECTOR)).exactTextInElement("");
    });
  });

  ["-L", "--logo"].forEach((flag) => {
    test.describe(`logo flag: ${flag}`, () => {
      test(`Should show a logo and no system information when the ${flag} flag is provided`, async ({
        page,
      }) => {
        // Arrange
        const input = `neofetch ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        const expected =
          "\n`+-----------_`+------------+`_-----------+`\n" +
          "*$$$$$$$$$$$$B<%$$$$$$$$$$$$8<@$$$$$$$$$$$$*\n" +
          "$$$$$$$$$$$$$@i%$$$$$$$$$$$$%i@$$$$$$$$$$$$$\n" +
          "YYYYYYYYXYYYYz>cYYYYYYYYYYYYc>zYYYYYYYYYYYYY\n" +
          "######*W&#*##M8M############M8M#############\n" +
          "$$$$$$$&a$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n" +
          "$$$$$*|^ ~Q$$$@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n" +
          "$$$$$b!    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n" +
          "$$$$$$$O~    ~0$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n" +
          "$$$$$$$$$0-`   +L%$$$$$$$$$$$$$$$$$$$$$$$$$$\n" +
          "$$$$$$$@$$hl '  ^k$$$$@@@@@@@@@@@@@@@$$$$$$$\n" +
          "$$$$$$$$k1.   :v8$$$$$$$$$$$$$$$$$$$$$$$$$$$\n" +
          "$$$$$$h(.   :u&$$$$$$dQ0QQQQQQQQQQQ00#$$$$$$\n" +
          "$$$$$w    :v8$$@$$$$@^               ($@$$$$\n" +
          "$$$$$@q}iv8$$@$$$$$$$-:::::::::::::;:v$@$$$$\n" +
          "$$$$$$$$$$$@$$$$$$$$$@%%%%%%%%%%%%%%%$$$$$$$\n" +
          "*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*\n" +
          "`+--------------------_______________-----+" +
          "\n\n ";

        await assertOutputInTerminal(page, input + expected);
      });
    });

    test(`Should show only newlines when the --off and ${flag} flags are provided`, async ({
      page,
    }) => {
      // Arrange
      const input = `neofetch --off ${flag}`;

      // Act
      await runCommand(page, input);

      // Assert
      await assertOutputInTerminal(page, `${input}\n\n `);
    });
  });
});
