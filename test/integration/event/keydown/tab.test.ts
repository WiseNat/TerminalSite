import { beforeEach, describe, expect, test, vi } from "vitest";
import { processTab } from "../../../../src/event/keydown/tab";
import TerminalUtil from "../../../../src/util/terminal_util";
import { defaultPrompt } from "../../../e2e/helper/constant/generic";
import { unmock } from "../../Unmock";
import MetaImportUtil from "../../../../src/util/meta_import_util";

// TODO: E2E tests

describe("Tab", () => {
  describe("processTab", () => {
    // Spy
    const appendText = vi.spyOn(TerminalUtil, "appendText");

    // Mock
    vi.mock("../../../../src/util/terminal_util");
    vi.mock("../../../../src/util/meta_import_util");

    // Other
    const event = new KeyboardEvent("keydown");

    beforeEach(async () => {
      await unmock("../../src/util/meta_import_util", [
        "default",
        "removePathFromKey",
      ]);
    });

    test.todo("Autocompletes a command name when typing a command", () => {
      // Arrange
      const userInput = "ech";
      vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

      // Act
      processTab(event);

      // Assert
      // TODO: Assert somehow. Negative assert based on method that passes to the owning command?
    });

    test.todo("Autocompletes a directory when typing a directory", () => {
      // Arrange
      const userInput = "~/Des";
      vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);

      // Act
      processTab(event);

      // Assert
      // TODO: Assert somehow. Negative assert based on method that passes to the owning command?
    });

    test.todo(
      "Passes autocompletion to the owning command when a command has been typed",
    );

    describe("Default autocompletion", () => {
      test("provides valid suggestions", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("ech");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).toHaveBeenCalledWith(
          `\necho\techoing\techo_ers\n${defaultPrompt}`,
        );
      });

      test("does nothing when there are no valid suggestions", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("foo");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).not.toHaveBeenCalled();
      });

      test("automatically inserts when there's only a single valid suggestion", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("echo_");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).toHaveBeenCalledWith("ers ");
      });

      test("adds a space when the command name is already typed and there's only a single valid suggestion", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("echoing");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).toHaveBeenCalledWith(" ");
      });

      test("does nothing when the command name is already typed with a space and there's only a single valid suggestion", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("echoing ");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).not.toHaveBeenCalled();
      });

      test("provides valid suggestions when a command name is already typed and there's other suggestions", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("echo");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).toHaveBeenCalledWith(
          `\necho\techoing\techo_ers\n${defaultPrompt}`,
        );
      });

      test("does nothing when nothing is typed", () => {
        // Arrange
        vi.mocked(TerminalUtil.getUserInput).mockReturnValue("");
        vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
          "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
          "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
        });

        // Act
        processTab(event);

        // Assert
        expect(appendText).not.toHaveBeenCalled();
      });
    });

    // TODO: tests for this
    describe.todo("Custom command autocompletion");
  });
});
