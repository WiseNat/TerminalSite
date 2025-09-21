import { describe, expect, vi, test } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import HOSTNAME_COMMAND from "../../../../../src/command/scripts/hostname.ts";

describe("Hostname", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  describe("run", () => {
    test("should output the hostname when no arguments are provided", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await HOSTNAME_COMMAND.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
        "\nnathan-wise-portfolio",
      );
    });

    // TODO: test cases...
    ["-d", "--domain"].forEach((flag) => {
      test(`Given the ${flag}, should output the domain name`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await HOSTNAME_COMMAND.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith("\nlocaldomain");
      });
    });

    ["-f", "--fqdn", "--long"].forEach((flag) => {
      test(`Given the ${flag}, should output the combined hostname & domain name`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await HOSTNAME_COMMAND.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "\nnathan-wise-portfolio.localdomain",
        );
      });
    });

    ["-i", "--ip-address"].forEach((flag) => {
      test(`Given the ${flag}, should output the host IP address`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await HOSTNAME_COMMAND.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith("\n127.0.0.1");
      });
    });
  });
});
