import { test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Hostname", () => {
  const domainName = "localdomain";
  const longName = "nathan-wise-portfolio.localdomain";

  test("should output the hostname without flags", async ({ page }) => {
    // Arrange
    const input = "hostname";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\nnathan-wise-portfolio`);
  });

  ["-d", "--domain"].forEach((flag) => {
    test.describe(`domain flag: ${flag}`, () => {
      test("should output the domain name", async ({ page }) => {
        // Arrange
        const input = `hostname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${domainName}`);
      });
    });
  });

  ["-f", "--fqdn", "--long"].forEach((flag) => {
    test.describe(`long flag: ${flag}`, () => {
      test("should output the combined hostname & domain name", async ({
        page,
      }) => {
        // Arrange
        const input = `hostname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${longName}`);
      });
    });
  });

  ["-i", "--ip-address"].forEach((flag) => {
    test.describe(`ip flag: ${flag}`, () => {
      test("should output the host IP address", async ({ page }) => {
        // Arrange
        const input = `hostname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n127.0.0.1`);
      });
    });
  });

  test.describe("Prioritisation of Flags", () => {
    [
      {
        type: "long flag has priority 1",
        flags: "-fid",
        expectedOutput: longName,
      },
      {
        type: "domain flag has priority 2",
        flags: "-id",
        expectedOutput: domainName,
      },
    ].forEach(({ type, flags, expectedOutput }) => {
      test(type, async ({ page }) => {
        // Arrange
        const input = `hostname ${flags}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${expectedOutput}`);
      });
    });
  });
});
