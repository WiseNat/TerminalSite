import { beforeEach, describe, expect, test, vi } from "vitest";
import MetaImportUtil from "../../../../src/util/meta_import_util";
import AutocompleteUtil from "../../../../src/util/autocomplete_util";
import { unmock } from "../../helper/unmock";
import TerminalUtil from "../../../../src/util/terminal_util";
import { Suggestion } from "../../../../src/command/command_script";
import { ZERO_WIDTH_SPACE } from "../../helper/constant.ts";

describe("AutocompleteUtil", () => {
  // Spy
  const setInput = vi.spyOn(TerminalUtil, "setInput");
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../src/util/terminal_util");
  vi.mock("../../../../src/util/meta_import_util");

  const prompt = "C:\\home\\nathanwise>";

  vi.mocked(TerminalUtil.getPrompt).mockReturnValue(prompt);

  describe("autocomplete", () => {
    describe("Input Insert", () => {
      [
        {
          type: "does nothing when there are no suggestions",
          suggestions: [],
          beforeCaret: "ech",
          afterCaret: "",
          expectedSetText: null,
        },
        {
          type: "automatically inserts when there's only a single valid suggestion",
          suggestions: [{ visual: "visual_echo", actual: "o " }],
          beforeCaret: "ech",
          afterCaret: "",
          expectedSetText: `${ZERO_WIDTH_SPACE}echo `,
        },
        {
          type: "adds a space when the command name is already typed and there's only a single valid suggestion",
          suggestions: [{ visual: "visual_echo", actual: " " }],
          beforeCaret: "echo",
          afterCaret: "",
          expectedSetText: `${ZERO_WIDTH_SPACE}echo `,
        },
        {
          type: "does nothing when the command name is already typed with a space and there's only a single valid suggestion",
          suggestions: [{ visual: "visual_echo", actual: "" }],
          beforeCaret: "echo ",
          afterCaret: "",
          expectedSetText: null,
        },
        {
          type: "does not append a second zero width space if one already exists",
          suggestions: [{ visual: "visual_echo", actual: "o " }],
          beforeCaret: `${ZERO_WIDTH_SPACE}ech`,
          afterCaret: "",
          expectedSetText: `${ZERO_WIDTH_SPACE}echo `,
        },
        {
          type: "does not add a space if after caret has a value",
          suggestions: [{ visual: "visual_echo", actual: "o " }],
          beforeCaret: "ech",
          afterCaret: " foo",
          expectedSetText: `${ZERO_WIDTH_SPACE}echo foo`,
        },
      ].forEach(
        ({ type, suggestions, beforeCaret, afterCaret, expectedSetText }) => {
          test(type, () => {
            // Arrange & Act
            AutocompleteUtil.autocomplete(suggestions, beforeCaret, afterCaret);

            // Assert
            if (expectedSetText == null) {
              expect(setInput).not.toHaveBeenCalled();
            } else {
              expect(setInput).toHaveBeenCalledWith(expectedSetText);
            }
          });
        },
      );
    });

    describe("Provides Suggestions", () => {
      [
        {
          type: "provides all visual suggestions when multiple suggestions exist",
          suggestions: [
            { visual: "visual_echo", actual: "echo " },
            {
              visual: "visual_echo_ing",
              actual: "echo_ing ",
            },
            { visual: "visual_echoers", actual: "echoers " },
          ],
          beforeCaret: "ech",
          afterCaret: " foo",
          expectedAppendText: "visual_echo\tvisual_echo_ing\tvisual_echoers",
        },
        {
          type: "provides valid suggestions when a command name is already typed and there's other suggestions",
          suggestions: [
            { visual: "visual_echo", actual: "echo " },
            {
              visual: "visual_echo_ing",
              actual: "echo_ing ",
            },
            { visual: "visual_echoers", actual: "echoers " },
          ],
          beforeCaret: "ech",
          afterCaret: " foo",
          expectedAppendText: "visual_echo\tvisual_echo_ing\tvisual_echoers",
        },
      ].forEach(
        ({
          type,
          suggestions,
          beforeCaret,
          afterCaret,
          expectedAppendText,
        }) => {
          test(type, () => {
            // Arrange & Act
            AutocompleteUtil.autocomplete(suggestions, beforeCaret, afterCaret);

            // Assert
            if (expectedAppendText == null) {
              expect(appendOutput).not.toHaveBeenCalled();
            } else {
              expect(appendOutput).toHaveBeenCalledWith(
                `${prompt}${beforeCaret}${afterCaret}\n${expectedAppendText}`,
                true,
              );
            }
          });
        },
      );
    });
  });

  describe("getCommandSuggestions", () => {
    // Other
    beforeEach(async () => {
      await unmock("../../../src/util/meta_import_util", [
        "default",
        "removePathFromKey",
      ]);
    });

    [
      {
        type: "provides valid suggestions that start with the name of the search value",
        searchValue: "ech",
        expectedCommandSuggestions: [
          { visual: "echo", actual: "o " },
          {
            visual: "echoing",
            actual: "oing ",
          },
          { visual: "echo_ers", actual: "o_ers " },
        ],
      },
      {
        type: "provides valid suggestions that includes the entirety of the search value",
        searchValue: "echo",
        expectedCommandSuggestions: [
          { visual: "echo", actual: " " },
          {
            visual: "echoing",
            actual: "ing ",
          },
          { visual: "echo_ers", actual: "_ers " },
        ],
      },
      {
        type: "provides no suggestions when that are no valid suggestions",
        searchValue: "echoo",
        expectedCommandSuggestions: [],
      },
    ].forEach(({ type, searchValue, expectedCommandSuggestions }) => {
      test(type, () => {
        // Arrange
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "./echo.ts": { default: { run: vi.fn() } },
          "./echoing.ts": { default: { run: vi.fn() } },
          "./echo_ers.ts": { default: { run: vi.fn() } },
          "./ec.ts": { default: { run: vi.fn() } },
          "./foo.ts": { default: { run: vi.fn() } },
        });

        // Act
        const commandSuggestions = AutocompleteUtil.getCommandSuggestions(
          searchValue,
          searchValue,
        );

        // Assert
        expect(commandSuggestions).toEqual(expectedCommandSuggestions);
      });
    });
  });

  describe("getFileAndDirectorySuggestions", () => {
    test("provides relevant files and directories when given a real path", () => {
      // Act
      const result =
        AutocompleteUtil.getFileAndDirectorySuggestions("src/main/foo/ba");

      // Assert
      expect(result).toMatchSnapshot();
    });

    test("provides nothing when given a fake path", () => {
      // Act
      const result =
        AutocompleteUtil.getFileAndDirectorySuggestions("some/fake/path");

      // Assert
      expect(result).toStrictEqual([]);
    });

    test("provides a dot file/dir when provided a path ending with a dot", () => {
      // Arrange
      const searchPath = "/src/main/.";

      // Act
      const result =
        AutocompleteUtil.getFileAndDirectorySuggestions(searchPath);

      // Assert
      const expected: Suggestion[] = [
        { visual: ".testing ", actual: "testing " },
        { visual: ".empty/", actual: "empty/" },
        { visual: ".full/", actual: "full/" },
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe("getDirectorySuggestions", () => {
    test("provides relevant directories when given a real path", () => {
      // Act
      const result =
        AutocompleteUtil.getDirectorySuggestions("src/main/foo/ba");

      // Assert
      expect(result).toMatchSnapshot();
      expect(result[0].actual.endsWith(" ")).toBeFalsy();
    });

    test("provides nothing when given a fake path", () => {
      // Act
      const result = AutocompleteUtil.getDirectorySuggestions("some/fake/path");

      // Assert
      expect(result).toStrictEqual([]);
    });

    test("provides a dot dir when provided a path ending with a dot", () => {
      // Arrange
      const searchPath = "/src/main/.";

      // Act
      const result = AutocompleteUtil.getDirectorySuggestions(searchPath);

      // Assert
      const expected: Suggestion[] = [
        { visual: ".empty/", actual: "empty/" },
        { visual: ".full/", actual: "full/" },
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe("getFileSuggestions", () => {
    test("provides relevant files when given a real path", () => {
      // Act
      const result = AutocompleteUtil.getFileSuggestions("src/main/foo/ba");

      // Assert
      expect(result).toMatchSnapshot();
      expect(result[0].actual.endsWith(" ")).toBeTruthy();
    });

    test("provides nothing when given a fake path", () => {
      // Act
      const result = AutocompleteUtil.getFileSuggestions("some/fake/path");

      // Assert
      expect(result).toStrictEqual([]);
    });

    test("provides a dot file when provided a path ending with a dot", () => {
      // Arrange
      const searchPath = "/src/main/.";

      // Act
      const result = AutocompleteUtil.getFileSuggestions(searchPath);

      // Assert
      const expected: Suggestion[] = [
        { visual: ".testing ", actual: "testing " },
      ];

      expect(result).toStrictEqual(expected);
    });
  });
});
