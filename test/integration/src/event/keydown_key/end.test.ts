import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { processEnd } from "../../../../../src/event/keydown_key/end";

describe("End", () => {
  describe("processEnd", () => {
    // Spy
    const cursorToEnd = vi.spyOn(TerminalUtil, "cursorToEnd");

    // Mock
    vi.mock("../../../../../src/util/terminal_util");

    // Other
    const event = new KeyboardEvent("keydown");

    test("moves the cursor to the end of the user input", () => {
      // Arrange & Act
      processEnd(event);

      // Assert
      expect(cursorToEnd).toHaveBeenCalledOnce();
    });
  });
});
