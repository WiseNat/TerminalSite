import { describe, test, expect, vi } from "vitest";
import { processHome } from "../../../../../src/event/keydown_key/home";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { ZERO_WIDTH_SPACE } from "../../../../e2e/helper/constant/generic";

describe("Home", () => {
  describe("processHome", () => {
    // Spy
    const cursorToIndex = vi.spyOn(TerminalUtil, "cursorToIndex");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    // Other
    const event = new KeyboardEvent("keydown");

    test("moves the cursor to the start of the user input when no zero-width space is present", async () => {
      // Arrange
      vi.mocked(TerminalUtil.getRawInput).mockReturnValue("foo bar");

      // Act
      await processHome(event);

      // Assert
      expect(cursorToIndex).toHaveBeenCalledExactlyOnceWith(0);
    });

    test("moves the cursor to the first index when a zero-width space is present", async () => {
      // Arrange
      vi.mocked(TerminalUtil.getRawInput).mockReturnValue(
        `${ZERO_WIDTH_SPACE}foo bar`,
      );

      // Act
      await processHome(event);

      // Assert
      expect(cursorToIndex).toHaveBeenCalledExactlyOnceWith(1);
    });
  });
});
