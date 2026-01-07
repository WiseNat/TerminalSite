import { beforeEach, describe, expect, test, vi } from "vitest";
import TERMINAL from "../../../../../src/command/scripts/terminal.ts";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import FlavourUtil from "../../../../../src/util/flavour_util.ts";
import { Flavour } from "../../../../../src/flavour/flavour.ts";

describe("Terminal", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");
  const setCurrentShellFlavour = vi.spyOn(
    FlavourUtil,
    "setCurrentShellFlavour",
  );

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/flavour_util");

  let document: { documentElement: { dataset: { theme: string } } };

  beforeEach(() => {
    document = {
      documentElement: {
        dataset: {
          theme: "",
        },
      },
    };

    vi.unstubAllGlobals();
    vi.stubGlobal("document", document);
  });

  describe("run", async () => {
    describe("No flags", () => {
      test("Given no flags and no args, should output an error", async () => {
        // Arrange
        const args: string[] = [];

        // Act
        await TERMINAL.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "terminal: No flags were provided. Run 'help terminal' for information on how to use this command.",
        );
      });

      test("Given no flags and args, should output an error", async () => {
        // Arrange
        const args: string[] = ["foo", "bar", "baz"];

        // Act
        await TERMINAL.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          "terminal: No flags were provided. Run 'help terminal' for information on how to use this command.",
        );
      });
    });

    ["-L", "--list"].forEach((flag) => {
      describe(`list flag: ${flag}`, () => {
        [
          {
            type: "no args",
            args: [],
          },
          {
            type: "args",
            args: ["foo", "bar", "baz"],
          },
        ].forEach(({ type, args }) => {
          test(`Given ${type}, all Themes and Flavours should be listed`, async () => {
            // Arrange
            vi.stubGlobal("getComputedStyle", () => ({
              getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
            }));

            vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue([
              "FLAVOUR_1",
              "FLAVOUR_2",
              "FLAVOUR_3",
              "FLAVOUR_4",
              "FLAVOUR_5",
              "FLAVOUR_6",
            ]);

            // Act
            await TERMINAL.run([flag, ...args]);

            // Assert
            expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
              "Themes:" +
                "\n- THEME_1" +
                "\n- THEME_2" +
                "\n- THEME_3" +
                "\n- THEME_4" +
                "\n" +
                "\nShell Flavours:" +
                "\n- FLAVOUR_1" +
                "\n- FLAVOUR_2" +
                "\n- FLAVOUR_3" +
                "\n- FLAVOUR_4" +
                "\n- FLAVOUR_5" +
                "\n- FLAVOUR_6",
            );
          });
        });

        [
          {
            type: "no Themes, only Flavours should be listed",
            expected:
              "Themes:" +
              "\nNone" +
              "\n" +
              "\nShell Flavours:" +
              "\n- FLAVOUR_1" +
              "\n- FLAVOUR_2" +
              "\n- FLAVOUR_3" +
              "\n- FLAVOUR_4" +
              "\n- FLAVOUR_5" +
              "\n- FLAVOUR_6",
            themes: "",
            flavours: [
              "FLAVOUR_1",
              "FLAVOUR_2",
              "FLAVOUR_3",
              "FLAVOUR_4",
              "FLAVOUR_5",
              "FLAVOUR_6",
            ],
          },
          {
            type: "no Flavours, only Themes should be listed",
            expected:
              "Themes:" +
              "\n- THEME_1" +
              "\n- THEME_2" +
              "\n- THEME_3" +
              "\n- THEME_4" +
              "\n" +
              "\nShell Flavours:" +
              "\nNone",
            themes: "THEME_1 THEME_2 THEME_3 THEME_4",
            flavours: [],
          },
          {
            type: "no Themes or Flavours, nothing should be listed",
            expected:
              "Themes:" + "\nNone" + "\n" + "\nShell Flavours:" + "\nNone",
            themes: "",
            flavours: [],
          },
        ].forEach(({ type, expected, themes, flavours }) => {
          test(`Given ${type}`, async () => {
            // Arrange
            vi.stubGlobal("getComputedStyle", () => ({
              getPropertyValue: () => themes,
            }));

            vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue(flavours);

            const args = [flag];

            // Act
            await TERMINAL.run(args);

            // Assert
            expect(appendOutput).toHaveBeenCalledExactlyOnceWith(expected);
          });
        });

        [
          {
            type: "Flavour flags (short)",
            args: ["-f"],
          },
          {
            type: "Flavour flags (long)",
            args: ["--flavour"],
          },
          {
            type: "Theme flags (short)",
            args: ["-t"],
          },
          {
            type: "Theme flags (long)",
            args: ["--theme"],
          },
        ].forEach(({ type, args }) => {
          test(`Given additional ${type}, should just output themes and flavours`, async () => {
            // Arrange
            vi.stubGlobal("getComputedStyle", () => ({
              getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
            }));

            vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue([
              "FLAVOUR_1",
              "FLAVOUR_2",
              "FLAVOUR_3",
              "FLAVOUR_4",
              "FLAVOUR_5",
              "FLAVOUR_6",
            ]);

            // Act
            await TERMINAL.run([flag, ...args]);

            // Assert
            expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
              "Themes:" +
                "\n- THEME_1" +
                "\n- THEME_2" +
                "\n- THEME_3" +
                "\n- THEME_4" +
                "\n" +
                "\nShell Flavours:" +
                "\n- FLAVOUR_1" +
                "\n- FLAVOUR_2" +
                "\n- FLAVOUR_3" +
                "\n- FLAVOUR_4" +
                "\n- FLAVOUR_5" +
                "\n- FLAVOUR_6",
            );
          });
        });
      });
    });

    ["-t", "--theme"].forEach((flag) => {
      describe(`theme ${flag}`, () => {
        test("Given a valid theme, should change the theme to that", async () => {
          // Arrange
          vi.stubGlobal("getComputedStyle", () => ({
            getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
          }));

          const theme = "THEME_3";
          const args = [flag, theme];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            `Changing Terminal Theme to '${theme}'`,
          );
          expect(document.documentElement.dataset.theme).toEqual(theme);
        });

        test("Given a theme and only that theme is available, should change the theme to that", async () => {
          // Arrange
          vi.stubGlobal("getComputedStyle", () => ({
            getPropertyValue: () => "THEME_1",
          }));

          const theme = "THEME_1";
          const args = [flag, theme];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            `Changing Terminal Theme to '${theme}'`,
          );
          expect(document.documentElement.dataset.theme).toEqual(theme);
        });

        test("Given no theme, should output an error message", async () => {
          // Arrange
          vi.stubGlobal("getComputedStyle", () => ({
            getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
          }));

          const theme = "";
          const args = [flag, theme];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            "terminal: No valid Theme was provided. Run 'terminal --list' to view all available Themes",
          );
        });

        test("Given an invalid theme, should output an error message", async () => {
          // Arrange
          vi.stubGlobal("getComputedStyle", () => ({
            getPropertyValue: () => "THEME_1 THEME_2 THEME_3 THEME_4",
          }));

          const theme = "FOO";
          const args = [flag, theme];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            `terminal: Theme '${theme}' is not valid. Run 'terminal --list' to view all available Themes`,
          );
        });

        test("Given no themes available, should output an error message", async () => {
          // Arrange
          vi.stubGlobal("getComputedStyle", () => ({
            getPropertyValue: () => "",
          }));

          const theme = "THEME_1";
          const args = [flag, theme];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            "terminal: No Themes are available",
          );
        });
      });
    });

    ["-f", "--flavour"].forEach((flag) => {
      describe(`flavour ${flag}`, () => {
        test("Given a valid flavour, should change the flavour to that", async () => {
          // Arrange
          vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue([
            "FLAVOUR_1",
            "FLAVOUR_2",
            "FLAVOUR_3",
            "FLAVOUR_4",
            "FLAVOUR_5",
          ]);
          const flavourMock: Flavour = {
            getInitialPrompt: vi.fn(),
            getPrompt: () => {
              return {
                value: "",
                isHTML: false,
              };
            },
          };
          vi.spyOn(FlavourUtil, "getShellFlavour").mockReturnValue(flavourMock);

          const flavour = "FLAVOUR_3";
          const args = [flag, flavour];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            `Changing Shell Flavour to '${flavour}'`,
          );
          expect(setCurrentShellFlavour).toHaveBeenCalledExactlyOnceWith(
            flavourMock,
          );
        });

        test("Given no flavour, should output an error message", async () => {
          // Arrange
          vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue([
            "FLAVOUR_1",
            "FLAVOUR_2",
            "FLAVOUR_3",
            "FLAVOUR_4",
            "FLAVOUR_5",
          ]);
          const flavourMock: Flavour = {
            getInitialPrompt: vi.fn(),
            getPrompt: () => {
              return {
                value: "",
                isHTML: false,
              };
            },
          };
          vi.spyOn(FlavourUtil, "getShellFlavour").mockReturnValue(flavourMock);

          const flavour = "";
          const args = [flag, flavour];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            "terminal: No valid Shell Flavour was provided. Run 'terminal --list' to view all available Flavours",
          );
        });

        test("Given an invalid flavour, should output an error message", async () => {
          // Arrange
          vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue([
            "FLAVOUR_1",
            "FLAVOUR_2",
            "FLAVOUR_3",
            "FLAVOUR_4",
            "FLAVOUR_5",
          ]);
          vi.spyOn(FlavourUtil, "getShellFlavour").mockReturnValue(null);

          const flavour = "FLAVOUR_5";
          const args = [flag, flavour];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            `terminal: Shell Flavour '${flavour}' is not valid. Run 'terminal --list' to view all available Flavours`,
          );
        });

        test("Given no flavours available, should output an error message", async () => {
          // Arrange
          vi.spyOn(FlavourUtil, "getFlavours").mockReturnValue([]);

          const flavour = "FLAVOUR_5";
          const args = [flag, flavour];

          // Act
          await TERMINAL.run(args);

          // Assert
          expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
            "terminal: No Shell Flavours are available",
          );
        });
      });
    });
  });
});
