import { describe, expect, test, vi } from "vitest";
import { processTab } from "../../../../../src/event/keydown_key/tab";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { CommandScript } from "../../../../../src/command/command_script";
import CommandUtil from "../../../../../src/util/command_util";
import AutocompleteUtil from "../../../../../src/util/autocomplete_util";
import HtmlUtil from "../../../../../src/util/html_util.ts";

describe("Tab", () => {
  // Spy
  const getCommandScript = vi.spyOn(CommandUtil, "getCommandScript");
  const getCommandSuggestions = vi.spyOn(
    AutocompleteUtil,
    "getCommandSuggestions",
  );
  const getFileAndDirectorySuggestions = vi.spyOn(
    AutocompleteUtil,
    "getFileAndDirectorySuggestions",
  );
  const autocomplete = vi.spyOn(AutocompleteUtil, "autocomplete");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");
  vi.mock("../../../../../src/util/command_import_util");
  vi.mock("../../../../../src/util/html_util");

  const event = new KeyboardEvent("keydown");

  describe("processTab", () => {
    describe("Default autocompletion", () => {
      test("Autocompletes a command name when typing a command", async () => {
        // Arrange
        const userInput = "ech";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        // Act
        await processTab(event);

        // Assert
        expect(getCommandSuggestions).toHaveBeenCalledOnce();
        expect(getFileAndDirectorySuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test.todo(
        "Autocompletes a directory when typing a directory",
        async () => {},
      );

      test("when a command has been typed without a space", async () => {
        // Arrange
        const userInput = "echo";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        // Act
        await processTab(event);

        // Assert
        expect(getCommandSuggestions).toHaveBeenCalledOnce();
        expect(getFileAndDirectorySuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });
    });

    describe("Custom command autocompletion", () => {
      test("when a command has been typed with a space", async () => {
        // Arrange
        const userInput = "echo ";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: vi.fn().mockResolvedValue([]),
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        await processTab(event);

        // Assert
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getFileAndDirectorySuggestions).not.toHaveBeenCalled();
        expect(autocomplete).not.toHaveBeenCalledOnce();
      });

      test("runs the default autocomplete if the command does not exist", async () => {
        // Arrange
        const userInput = "echo -e";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(null);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        // Act
        await processTab(event);

        // Assert
        expect(getCommandScript).toHaveBeenCalledOnce();
        expect(getCommandScript).toReturnWith(null); // implicit check
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getFileAndDirectorySuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the command autocomplete if it exists", async () => {
        // Arrange
        const userInput = "echo -e";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: vi.fn().mockResolvedValue([]),
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        await processTab(event);

        // Assert
        expect(getCommandScript).toHaveBeenCalledOnce();
        expect(mockCommandFile.autocomplete).toHaveBeenCalled();
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getFileAndDirectorySuggestions).not.toHaveBeenCalled();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the default autocomplete if a command autocomplete does not exist", async () => {
        // Arrange
        const userInput = "echo -e";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: undefined,
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        await processTab(event);

        // Assert
        expect(getCommandScript).toHaveBeenCalledOnce();
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getFileAndDirectorySuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs the default autocomplete if the command autocomplete returns null", async () => {
        // Arrange
        const userInput = "echo -e";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        const mockCommandFile: CommandScript = {
          run: vi.fn(),
          autocomplete: vi.fn().mockResolvedValue(null),
        };
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(
          mockCommandFile,
        );

        // Act
        await processTab(event);

        // Assert
        expect(mockCommandFile.autocomplete).toHaveBeenCalled();
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getFileAndDirectorySuggestions).toHaveBeenCalledOnce();
        expect(autocomplete).toHaveBeenCalledOnce();
      });

      test("runs nothing if there is an empty arg after an unknown command", async () => {
        // Arrange
        const userInput = "fakecommand ";
        vi.mocked(TerminalUtil.getRawInput).mockReturnValue(userInput);
        vi.mocked(CommandUtil.getCommandScript).mockReturnValue(null);
        vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(userInput.length);

        // Act
        await processTab(event);

        // Assert
        expect(getCommandSuggestions).not.toHaveBeenCalled();
        expect(getFileAndDirectorySuggestions).not.toHaveBeenCalled();
        expect(autocomplete).not.toHaveBeenCalledOnce();
      });
    });

    describe("Multiple Arguments", () => {
      [
        {
          input: "tree ",
          caret: 5,
        },
        {
          input: "tree /some/directory /some/file",
          caret: 21,
        },
      ].forEach(({ input, caret }) => {
        test("does nothing if there is a space immediately before the caret", async () => {
          // Arrange
          vi.mocked(TerminalUtil.getRawInput).mockReturnValue(input);
          vi.mocked(CommandUtil.getCommandScript).mockReturnValue(null);
          vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(caret);

          // Act
          await processTab(event);

          // Assert
          expect(getCommandSuggestions).not.toHaveBeenCalled();
          expect(getFileAndDirectorySuggestions).not.toHaveBeenCalled();
          expect(autocomplete).not.toHaveBeenCalledOnce();
        });
      });

      [
        {
          input: "tree /some/directory /some/file",
          caret: 1,
          expectedBefore: "t",
          expectedAfter: "ree /some/directory /some/file",
        },
        {
          input: "tree /some/directory /some/file",
          caret: 10,
          expectedBefore: "tree /some",
          expectedAfter: "/directory /some/file",
        },
        {
          input: "tree /some/directory /some/file",
          caret: 31,
          expectedBefore: "tree /some/directory /some/file",
          expectedAfter: "",
        },
      ].forEach(({ input, caret, expectedBefore, expectedAfter }) => {
        test("calls autocomplete with expected before and after values", async () => {
          // Arrange
          vi.mocked(TerminalUtil.getRawInput).mockReturnValue(input);
          vi.mocked(CommandUtil.getCommandScript).mockReturnValue(null);
          vi.mocked(HtmlUtil.getCaretPosition).mockReturnValue(caret);

          // Act
          await processTab(event);

          // Assert
          expect(autocomplete).toHaveBeenCalledExactlyOnceWith(
            expect.anything(),
            expectedBefore,
            expectedAfter,
          );
        });
      });
    });
  });
});
