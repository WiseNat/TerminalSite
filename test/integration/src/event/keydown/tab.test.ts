import { describe, expect, test, vi } from "vitest";
import { processTab } from "../../../../../src/event/keydown/tab";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { CommandScript } from "../../../../../src/command/command_script";
import CommandUtil from "../../../../../src/util/command_util";
import AutocompleteUtil from "../../../../../src/util/autocomplete_util";

describe("Tab", () => {
  describe("processTab", () => {
    // Spy
    const getCommandScript = vi.spyOn(CommandUtil, "getCommandScript");
    const getCommandSuggestions = vi.spyOn(
      AutocompleteUtil,
      "getCommandSuggestions",
    );
    const getDirectorySuggestions = vi.spyOn(
      AutocompleteUtil,
      "getDirectorySuggestions",
    );
    const getFileSuggestions = vi.spyOn(AutocompleteUtil, "getFileSuggestions");
    const autocomplete = vi.spyOn(AutocompleteUtil, "autocomplete");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");
    vi.mock("../../../../../src/util/meta_import_util");

    // Other
    const event = new KeyboardEvent("keydown");

    describe("Default autocompletion", () => {
      test("Autocompletes a command name when typing a command", () => {
        // Arrange
        const userInput = "ech";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

        // Act
        processTab(event);

        // Assert
        expect(getCommandSuggestions).toHaveBeenCalledOnce();
        expect(getDirectorySuggestions).toHaveBeenCalledOnce();
        expect(getFileSuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test.todo("Autocompletes a directory when typing a directory", () => {});

      test("when a command has been typed without a space", () => {
        // Arrange
        const userInput = "echo";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

        // Act
        processTab(event);

        // Assert
        expect(getCommandSuggestions).toHaveBeenCalledOnce();
        expect(getDirectorySuggestions).toHaveBeenCalledOnce();
        expect(getFileSuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });
    });

    describe("Custom command autocompletion", () => {
      test("when a command has been typed with a space", () => {
        // Arrange
        const userInput = "echo ";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: vi.fn(() => {
            return [];
          }),
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        processTab(event);

        // Assert
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getDirectorySuggestions).not.toHaveBeenCalled();
        expect(getFileSuggestions).not.toHaveBeenCalled();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the default autocomplete if the command does not exist", () => {
        // Arrange
        const userInput = "echo -e ";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(null);

        // Act
        processTab(event);

        // Assert
        expect(getCommandScript).toHaveBeenCalledOnce();
        expect(getCommandScript).toReturnWith(null); // implicit check
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getDirectorySuggestions).toHaveBeenCalledOnce();
        expect(getFileSuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the command autocomplete if it exists", () => {
        // Arrange
        const userInput = "echo -e ";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: vi.fn(() => {
            return [];
          }),
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        processTab(event);

        // Assert
        expect(getCommandScript).toHaveBeenCalledOnce();
        expect(mockCommandFile.autocomplete).toHaveBeenCalled();
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getDirectorySuggestions).not.toHaveBeenCalled();
        expect(getFileSuggestions).not.toHaveBeenCalled();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the default autocomplete if a command autocomplete does not exist", () => {
        // Arrange
        const userInput = "echo -e ";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: undefined,
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        processTab(event);

        // Assert
        expect(getCommandScript).toHaveBeenCalledOnce();
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getDirectorySuggestions).toHaveBeenCalledOnce();
        expect(getFileSuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the default autocomplete if the command autocomplete returns null", () => {
        // Arrange
        const userInput = "echo -e ";
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: vi.fn(() => {
            return null;
          }),
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        processTab(event);

        // Assert
        expect(mockCommandFile.autocomplete).toHaveBeenCalled();
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getDirectorySuggestions).toHaveBeenCalledOnce();
        expect(getFileSuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });
    });
  });
});
