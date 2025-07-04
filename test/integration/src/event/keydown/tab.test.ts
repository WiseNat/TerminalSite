import { beforeEach, describe, expect, test, vi } from "vitest";
import { processTab } from "../../../../../src/event/keydown/tab";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { defaultPrompt } from "../../../../e2e/helper/constant/generic";
import { unmock } from "../../../helper/Unmock";
import MetaImportUtil from "../../../../../src/util/meta_import_util";

// TODO: E2E tests

describe("Tab", () => {
  describe("processTab", () => {
    // Spy
    const appendText = vi.spyOn(TerminalUtil, "appendText");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");
    vi.mock("../../../../../src/util/meta_import_util");

    // Other
    const event = new KeyboardEvent("keydown");

    beforeEach(async () => {
      await unmock("../../../src/util/meta_import_util", [
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
      [
        {
          type: "provides valid suggestions",
          userInput: "ech",
          appendTextCalledWith: `\necho\techoing\techo_ers\n${defaultPrompt}`,
        },
        {
          type: "does nothing when there are no valid suggestions",
          userInput: "foo",
          appendTextCalledWith: null,
        },
        {
          type: "automatically inserts when there's only a single valid suggestion",
          userInput: "echo_",
          appendTextCalledWith: "ers ",
        },
        {
          type: "adds a space when the command name is already typed and there's only a single valid suggestion",
          userInput: "echoing",
          appendTextCalledWith: " ",
        },
        {
          type: "does nothing when the command name is already typed with a space and there's only a single valid suggestion",
          userInput: "echoing ",
          appendTextCalledWith: null,
        },
        {
          type: "provides valid suggestions when a command name is already typed and there's other suggestions",
          userInput: "echo",
          appendTextCalledWith: `\necho\techoing\techo_ers\n${defaultPrompt}`,
        },
        {
          type: "does nothing when nothing is typed",
          userInput: "",
          appendTextCalledWith: null,
        },
      ].forEach(({ type, userInput, appendTextCalledWith }) => {
        test(type, () => {
          // Arrange
          vi.mocked(TerminalUtil.getUserInput).mockReturnValue(userInput);
          vi.mocked(MetaImportUtil.getCommandScripts).mockReturnValue({
            "/src/command/scripts/echo.ts": { default: { run: vi.fn() } },
            "/src/command/scripts/echoing.ts": { default: { run: vi.fn() } },
            "/src/command/scripts/echo_ers.ts": { default: { run: vi.fn() } },
          });

          // Act
          processTab(event);

          // Assert
          if (appendTextCalledWith == null) {
            expect(appendText).not.toHaveBeenCalled();
          } else {
            expect(appendText).toHaveBeenCalledWith(appendTextCalledWith);
          }
        });
      });
    });

    // TODO: tests for this
    describe.todo("Custom command autocompletion");
  });
});
