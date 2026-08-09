import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util";
import { processEnd } from "../../../../../src/event/keydown_key/end";

// Mocks
vi.mock("../../../../../src/util/terminal_util");

describe("End", () => {
  // Spy
  const cursorToEnd = vi.spyOn(TerminalUtil, "cursorToEnd");

  const event = new KeyboardEvent("keydown");

  describe("processEnd", () => {
    test("moves the cursor to the end of the user input", async () => {
      // Arrange & Act
      await processEnd(event);

      // Assert
      expect(cursorToEnd).toHaveBeenCalledOnce();
    });
  });
});
