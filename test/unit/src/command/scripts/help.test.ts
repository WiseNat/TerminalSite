import { beforeEach, describe, expect, test, vi } from "vitest";
import HELP, {
  HelpInformation,
} from "../../../../../src/command/scripts/help.ts";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import CommandImportUtil from "../../../../../src/util/command_import_util.ts";
import { mockExtractVisibleText } from "../../../helper/mocks.ts";
import CssUtil from "../../../../../src/util/css_util.ts";

describe("Help", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  mockExtractVisibleText();
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_import_util");
  vi.mock("../../../../../src/util/html_util");
  vi.mock("../../../../../src/util/css_util");

  describe("run", async () => {
    beforeEach(() => {
      vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
        echo: {
          default: {
            run: vi.fn(),
            help: () => ({
              synopsis: "echo [ARG ...]",
              shortDescription: "ECHO SHORT DESCRIPTION",
              longDescription: "ECHO LONG DESCRIPTION",
              additionalInformation: "ECHO ADDITIONAL INFORMATION",
              arguments: [
                {
                  name: "FOO",
                  description: "ECHO FOO DESC",
                },
                {
                  name: "BAR",
                  description: "ECHO BAR DESC",
                },
                {
                  name: "BAZ",
                  description: "ECHO BAZ DESC",
                },
              ],
            }),
          },
        },
        help: {
          default: {
            run: vi.fn(),
            help: () => ({
              synopsis: "help [ARG ...]",
              shortDescription: "HELP SHORT DESCRIPTION",
              longDescription: "HELP LONG DESCRIPTION",
              additionalInformation: "HELP ADDITIONAL INFORMATION",
              arguments: [
                {
                  name: "FOO",
                  description: "HELP FOO DESC",
                },
                {
                  name: "BAR",
                  description: "HELP BAR DESC",
                },
                {
                  name: "BAZ",
                  description: "HELP BAZ DESC",
                },
              ],
            }),
          },
        },
        cat: {
          default: {
            run: vi.fn(),
            help: () => ({
              synopsis: "cat [ARG ...]",
              shortDescription: "CAT SHORT DESCRIPTION",
              longDescription: "CAT LONG DESCRIPTION",
              additionalInformation: "CAT ADDITIONAL INFORMATION",
              arguments: [
                {
                  name: "FOO",
                  description: "CAT FOO DESC",
                },
                {
                  name: "BAR",
                  description: "CAT BAR DESC",
                },
                {
                  name: "BAZ",
                  description: "CAT BAZ DESC",
                },
              ],
            }),
          },
        },
        vi: {
          default: {
            run: vi.fn(),
            help: () => ({
              synopsis: "vi [ARG ...]",
              shortDescription: "VI SHORT DESCRIPTION",
              longDescription: "VI LONG DESCRIPTION",
              additionalInformation: "VI ADDITIONAL INFORMATION",
              arguments: [
                {
                  name: "FOO",
                  description: "VI FOO DESC",
                },
                {
                  name: "BAR",
                  description: "VI BAR DESC",
                },
                {
                  name: "BAZ",
                  description: "VI BAZ DESC",
                },
              ],
            }),
          },
        },
        less: {
          default: {
            run: vi.fn(),
            help: () => ({
              synopsis: "less [ARG ...]",
              shortDescription: "LESS SHORT DESCRIPTION",
              longDescription: "LESS LONG DESCRIPTION",
              additionalInformation: "LESS ADDITIONAL INFORMATION",
              arguments: [
                {
                  name: "FOO",
                  description: "LESS FOO DESC",
                },
                {
                  name: "BAR",
                  description: "LESS BAR DESC",
                },
                {
                  name: "BAZ",
                  description: "LESS BAZ DESC",
                },
              ],
            }),
          },
        },
        grep: {
          default: {
            run: vi.fn(),
            help: () => null,
          },
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.mocked(CssUtil.getStyle).mockReturnValue({ font: "" });
      vi.mocked(CssUtil.getCharacterWidth).mockReturnValue(1);
      vi.mocked(CssUtil.getElementWidth).mockReturnValue(50);
    });

    [
      {
        type: "no flags",
        flags: "",
      },
      {
        type: "short description flag",
        flags: "-d",
      },
      {
        type: "usage synopsis flag",
        flags: "-s",
      },
    ].forEach(({ type, flags }) => {
      test(`given no args & ${type}, should output a list of short usage synopses for all available commands across two columns`, async () => {
        // Arrange
        const args = flags === "" ? [] : [flags];

        // Act
        await HELP.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledWith(
          " cat [ARG ...]    less [ARG ...]\n" +
            " echo [ARG ...]   vi [ARG ...]\n" +
            " help [ARG ...]",
        );
      });
    });

    test("given a command and no flags, should output the full help information for that command", async () => {
      // Arrange
      const args = ["vi"];

      // Act
      await HELP.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith(
        "vi: vi [ARG ...]\n" +
          "    VI SHORT DESCRIPTION\n" +
          "\n" +
          "    VI LONG DESCRIPTION\n" +
          "\n" +
          "    VI ADDITIONAL INFORMATION\n" +
          "\n" +
          "    Arguments:\n" +
          "      FOO  VI FOO DESC\n" +
          "      BAR  VI BAR DESC\n" +
          "      BAZ  VI BAZ DESC",
      );
    });

    test("given multiple commands and no flags, should output the full help information for the first command", async () => {
      // Arrange
      const args = ["vi", "cat", "echo"];

      // Act
      await HELP.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith(
        "vi: vi [ARG ...]\n" +
          "    VI SHORT DESCRIPTION\n" +
          "\n" +
          "    VI LONG DESCRIPTION\n" +
          "\n" +
          "    VI ADDITIONAL INFORMATION\n" +
          "\n" +
          "    Arguments:\n" +
          "      FOO  VI FOO DESC\n" +
          "      BAR  VI BAR DESC\n" +
          "      BAZ  VI BAZ DESC",
      );
    });

    test("given a command with no help description, should output an error", async () => {
      // Arrange
      const args = ["grep"];

      // Act
      await HELP.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith(
        "bash: help: no help topics match 'grep'. Try 'help' to view a list of available help topics.",
      );
    });

    test("given no valid commands, should output an error", async () => {
      // Arrange
      const args = ["foo", "bar"];

      // Act
      await HELP.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledWith(
        "bash: help: no help topics match 'bar'. Try 'help' to view a list of available help topics.",
      );
    });

    [
      {
        isLongDescriptionUndefined: true,
        isAdditionalInformationUndefined: true,
        isArgumentsUndefined: true,
        isOptionsUndefined: true,
        expected: "test: test [ARG ...]\n" + "    TEST SHORT DESCRIPTION",
      },
      {
        isLongDescriptionUndefined: false,
        isAdditionalInformationUndefined: true,
        isArgumentsUndefined: true,
        isOptionsUndefined: true,
        expected:
          "test: test [ARG ...]\n" +
          "    TEST SHORT DESCRIPTION\n" +
          "\n" +
          "    TEST LONG DESCRIPTION",
      },
      {
        isLongDescriptionUndefined: true,
        isAdditionalInformationUndefined: false,
        isArgumentsUndefined: true,
        isOptionsUndefined: true,
        expected:
          "test: test [ARG ...]\n" +
          "    TEST SHORT DESCRIPTION\n" +
          "\n" +
          "    TEST ADDITIONAL INFORMATION",
      },
      {
        isLongDescriptionUndefined: true,
        isAdditionalInformationUndefined: true,
        isArgumentsUndefined: false,
        isOptionsUndefined: true,
        expected:
          "test: test [ARG ...]\n" +
          "    TEST SHORT DESCRIPTION\n" +
          "\n" +
          "    Arguments:\n" +
          "      FOO  TEST FOO DESC\n" +
          "      BAR  TEST BAR DESC\n" +
          "      BAZ  TEST BAZ DESC",
      },
      {
        isLongDescriptionUndefined: true,
        isAdditionalInformationUndefined: true,
        isArgumentsUndefined: true,
        isOptionsUndefined: false,
        expected:
          "test: test [ARG ...]\n" +
          "    TEST SHORT DESCRIPTION\n" +
          "\n" +
          "    Options:\n" +
          "      -a  some description for a\n" +
          "      -b  some description for b",
      },
    ].forEach(
      ({
        isLongDescriptionUndefined,
        isAdditionalInformationUndefined,
        isArgumentsUndefined,
        isOptionsUndefined,
        expected,
      }) => {
        test("given a command with only required help information values, should output valid help information", async () => {
          // Arrange

          const testHelpInformation: HelpInformation = {
            synopsis: "test [ARG ...]",
            shortDescription: "TEST SHORT DESCRIPTION",
            longDescription: "TEST LONG DESCRIPTION",
            additionalInformation: "TEST ADDITIONAL INFORMATION",
            arguments: [
              {
                name: "FOO",
                description: "TEST FOO DESC",
              },
              {
                name: "BAR",
                description: "TEST BAR DESC",
              },
              {
                name: "BAZ",
                description: "TEST BAZ DESC",
              },
            ],
            options: [
              {
                short: "a",
                description: "some description for a",
              },
              {
                short: "b",
                description: "some description for b",
              },
            ],
          };

          // prettier-ignore
          {
            if (isLongDescriptionUndefined) testHelpInformation.longDescription = undefined;
            if (isAdditionalInformationUndefined) testHelpInformation.additionalInformation = undefined;
            if (isArgumentsUndefined) testHelpInformation.arguments = undefined;
            if (isOptionsUndefined) testHelpInformation.options = undefined;
          }

          vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
            test: {
              default: {
                run: vi.fn(),
                help: () => testHelpInformation,
              },
            },
          });

          const args = ["test"];

          // Act
          await HELP.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledWith(expected);
        });
      },
    );

    describe("short description flag: -d", () => {
      test("given a command and the short description flag, should output a short description for that command", async () => {
        // Arrange
        const args = ["vi", "-d"];

        // Act
        await HELP.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledWith("vi - VI SHORT DESCRIPTION");
      });
    });

    describe("usage synopsis flag: -s", () => {
      test("given a command and the usage synopsis flag, should output a short usage synopsis for that command", async () => {
        // Arrange
        const args = ["vi", "-s"];

        // Act
        await HELP.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledWith("vi: vi [ARG ...]");
      });
    });
  });
});
