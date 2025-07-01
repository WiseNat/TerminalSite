import { beforeEach, describe, expect, test, vi } from "vitest";
import { input } from "../../../src/event/input";
import TerminalUtil from "../../../src/util/terminal_util";

describe("Input Event", () => {
  vi.mock("../../../src/util/terminal_util");

  describe("input", () => {
    // Mocks & Spies
    const setText = vi.spyOn(TerminalUtil, "setText");

    const previousReadOnly = ">>>";
    const previousContent = previousReadOnly + "PREVIOUS CONTENT";

    beforeEach(async () => {
      vi.mocked(TerminalUtil.getPreviousContent).mockReturnValue(
        previousContent,
      );
    });

    test("prevents read-only content being modified", () => {
      // Arrange
      vi.mocked(TerminalUtil.getReadOnlyContent).mockImplementation((text) => {
        // Current read-only content (modified)
        if (text == null) {
          return previousReadOnly.replace(">", "F>");
        }

        return previousReadOnly;
      });

      const inputtedData = "foo";

      const event = new InputEvent("input", {
        inputType: "insertText",
        data: inputtedData,
      });

      // Act
      input(event);

      // Assert
      expect(setText).toHaveBeenCalledWith(previousContent + inputtedData);
    });

    test("allows user-input content being modified", () => {
      // Arrange
      vi.mocked(TerminalUtil.getReadOnlyContent).mockReturnValue(
        previousReadOnly,
      );

      const inputtedData = "foo";

      const event = new InputEvent("input", {
        inputType: "insertText",
        data: inputtedData,
      });

      // Act
      input(event);

      // Assert
      expect(setText).not.toHaveBeenCalled();
    });

    [{ type: "insertLineBreak" }, { type: "insertParagraph" }].forEach(
      ({ type }) => {
        test("does not append newlines when they're added to read-only content", () => {
          // Arrange
          vi.mocked(TerminalUtil.getReadOnlyContent).mockImplementation(
            (text) => {
              // Current read-only content
              if (text == null) {
                return previousReadOnly.replace(">", "\n>");
              }

              // Previous read-only content
              return previousReadOnly;
            },
          );

          const event = new InputEvent("input", {
            inputType: type,
          });

          // Act
          input(event);

          // Assert
          expect(setText).toHaveBeenCalledWith(previousContent);
        });

        test("does not allow newlines when they're added in the user-input", () => {
          // Arrange
          vi.mocked(TerminalUtil.getReadOnlyContent).mockReturnValue(
            previousReadOnly,
          );

          const event = new InputEvent("input", {
            inputType: type,
          });

          // Act
          input(event);

          // Assert
          expect(setText).toHaveBeenCalledWith(previousContent);
        });
      },
    );
  });
});
