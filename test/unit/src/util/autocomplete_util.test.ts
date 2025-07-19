import { beforeEach, describe, expect, test, vi } from "vitest";
import MetaImportUtil from "../../../../src/util/meta_import_util";
import AutocompleteUtil from "../../../../src/util/autocomplete_util";
import { unmock } from "../../helper/Unmock";
import TerminalUtil from "../../../../src/util/terminal_util";
import { userPrompt } from "../../../../src/constant/prompt";

describe("AutocompleteUtil", () => {
  describe("autocomplete", () => {
    // Spy
    const appendText = vi.spyOn(TerminalUtil, "appendText");

    // Mock
    vi.mock("../../../../src/util/terminal_util");

    [
      {
        type: "does nothing when there are no suggestions",
        suggestions: [],
        userInput: "ech",
        expectedAppendText: null,
      },
      {
        type: "automatically inserts when there's only a single valid suggestion",
        suggestions: ["echo"],
        userInput: "ech",
        expectedAppendText: "o ",
      },
      {
        type: "adds a space when the command name is already typed and there's only a single valid suggestion",
        suggestions: ["echo"],
        userInput: "echo",
        expectedAppendText: " ",
      },
      {
        type: "does nothing when the command name is already typed with a space and there's only a single valid suggestion",
        suggestions: ["echo"],
        userInput: "echo ",
        expectedAppendText: null,
      },
      {
        type: "provides all suggestions when multiple suggestions exist",
        suggestions: ["echo", "echo_ing", "echoers"],
        userInput: "ech",
        expectedAppendText: `\necho\techo_ing\techoers\n${userPrompt}`,
      },
      {
        type: "provides valid suggestions when a command name is already typed and there's other suggestions",
        suggestions: ["echo", "echo_ing", "echoers"],
        userInput: "echo",
        expectedAppendText: `\necho\techo_ing\techoers\n${userPrompt}`,
      },
    ].forEach(({ type, suggestions, userInput, expectedAppendText }) => {
      test(type, () => {
        // Arrange & Act
        AutocompleteUtil.autocomplete(suggestions, userInput);

        // Assert
        if (expectedAppendText == null) {
          expect(appendText).not.toHaveBeenCalled();
        } else {
          expect(appendText).toHaveBeenCalledWith(expectedAppendText);
        }
      });
    });
  });

  describe("getCommandSuggestions", () => {
    // Mock
    vi.mock("../../../../src/util/meta_import_util");

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
        expectedCommandSuggestions: ["echo", "echoing", "echo_ers"],
      },
      {
        type: "provides valid suggestions that includes the entirety of the search value",
        searchValue: "echo",
        expectedCommandSuggestions: ["echo", "echoing", "echo_ers"],
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
        const commandSuggestions =
          AutocompleteUtil.getCommandSuggestions(searchValue);

        // Assert
        expect(commandSuggestions).toEqual(expectedCommandSuggestions);
      });
    });
  });

  describe.todo("getDirectorySuggestions", () => {});
  describe.todo("getFileSuggestions", () => {});
});
