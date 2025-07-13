import { describe, test, expect, vi } from "vitest";
import { processHome } from "../../../../../src/event/keydown_key/home";
import TerminalUtil from "../../../../../src/util/terminal_util";

describe("Home", () => {
  describe("processHome", () => {
    // Spy
    const cursorToIndex = vi.spyOn(TerminalUtil, "cursorToIndex");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    // Other
    const event = new KeyboardEvent("keydown");

    test("moves the cursor to the start of the user input", () => {
      // Arrange
      const readonlyText = "some example text";
      vi.mocked(TerminalUtil.getReadOnlyContent).mockReturnValue(readonlyText);

      // Act
      processHome(event);

      // Assert
      expect(cursorToIndex).toHaveBeenCalledExactlyOnceWith(
        readonlyText.length,
      );
    });
  });
});
