import { beforeEach, describe, expect, test, vi } from "vitest";
import CommandImportUtil from "../../../../src/util/command_import_util.ts";
import AutocompleteUtil from "../../../../src/util/autocomplete_util";
import { unmock } from "../../helper/unmock";
import TerminalUtil from "../../../../src/util/terminal_util";
import { Suggestion } from "../../../../src/command/command_script";
import { ZERO_WIDTH_SPACE } from "../../helper/constant.ts";
import FormatterUtil from "../../../../src/util/formatter_util.ts";

describe("AutocompleteUtil", () => {
  // Spy
  const setInput = vi.spyOn(TerminalUtil, "setInput");
  const appendRawOutput = vi.spyOn(TerminalUtil, "appendRawOutput");

  // Mock
  vi.mock("../../../../src/util/terminal_util");
  vi.mock("../../../../src/util/command_import_util");
  vi.mock("../../../../src/util/formatter_util");

  const prompt = "C:\\home\\nathanwise>";

  vi.mocked(TerminalUtil.getRawPrompt).mockReturnValue(prompt);
  vi.mocked(FormatterUtil.toDynamicGrid).mockImplementation((items) => {
    return items.join("\t");
  });

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
      test("provides all visual suggestions when multiple suggestions without a common prefix exist", () => {
        // Arrange
        const suggestions = [
          { visual: "VISUAL_echoFOO", actual: "FOO " },
          { visual: "VISUAL_echoBAR", actual: "BAR " },
          { visual: "VISUAL_echoBAZ", actual: "DAZ " },
        ];

        const beforeCaret = "ech";
        const afterCaret = " foo";

        // Act
        AutocompleteUtil.autocomplete(suggestions, beforeCaret, afterCaret);

        // Assert
        const expectedAppendText =
          "VISUAL_echoFOO\tVISUAL_echoBAR\tVISUAL_echoBAZ";
        expect(appendRawOutput).toHaveBeenCalledWith(
          `${prompt}${beforeCaret}${afterCaret}\n${expectedAppendText}`,
          true,
        );
      });

      test("provides all visual suggestions when multiple suggestions exist of which some have common prefixes", () => {
        // Arrange
        const suggestions = [
          { visual: "VISUAL_echoFOO", actual: "PRE_FOO " },
          { visual: "VISUAL_echoBAR", actual: "PRE_BAR " },
          { visual: "VISUAL_echoBAZ", actual: "DAZ " },
        ];

        const beforeCaret = "ech";
        const afterCaret = " foo";

        // Act
        AutocompleteUtil.autocomplete(suggestions, beforeCaret, afterCaret);

        // Assert
        const expectedAppendText =
          "VISUAL_echoFOO\tVISUAL_echoBAR\tVISUAL_echoBAZ";
        expect(appendRawOutput).toHaveBeenCalledWith(
          `${prompt}${beforeCaret}${afterCaret}\n${expectedAppendText}`,
          true,
        );
      });
    });

    describe("Partial autocomplete", () => {
      test("partially autocompletes when multiple suggestions exist of which all have a common prefix", () => {
        // Arrange
        const suggestions = [
          { visual: "A", actual: "ExampleA " },
          { visual: "B", actual: "ExampleB " },
          { visual: "C", actual: "ExampleC " },
        ];

        const beforeCaret = "a";
        const afterCaret = " b";

        // Act
        AutocompleteUtil.autocomplete(suggestions, beforeCaret, afterCaret);

        // Assert
        const expected = `${ZERO_WIDTH_SPACE}aExample b`;
        expect(setInput).toHaveBeenCalledWith(expected);
      });
    });
  });

  describe("getCommandSuggestions", () => {
    // Other
    beforeEach(async () => {
      await unmock("../../../src/util/command_import_util", [
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
        vi.mocked(CommandImportUtil.getCommandScripts).mockReturnValue({
          echo: { default: { run: vi.fn(), help: vi.fn() } },
          echoing: { default: { run: vi.fn(), help: vi.fn() } },
          echo_ers: { default: { run: vi.fn(), help: vi.fn() } },
          ec: { default: { run: vi.fn(), help: vi.fn() } },
          foo: { default: { run: vi.fn(), help: vi.fn() } },
        });

        // Act
        const commandSuggestions =
          AutocompleteUtil.getCommandSuggestions(searchValue);

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
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "actual": "r/",
            "visual": "bar/",
          },
          {
            "actual": "zzing.gaz ",
            "visual": "bazzing.gaz ",
          },
        ]
      `);
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
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "actual": "r/",
            "visual": "bar/",
          },
        ]
      `);
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
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "actual": "zzing.gaz ",
            "visual": "bazzing.gaz ",
          },
        ]
      `);
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
