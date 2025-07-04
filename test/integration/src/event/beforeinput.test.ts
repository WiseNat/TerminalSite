import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../src/util/terminal_util";
import { beforeinput } from "../../../../src/event/beforeinput";

describe("Before Input Event", () => {
  describe("beforeinput", () => {
    // Mock
    vi.mock("../../../../src/util/terminal_util");

    test("updates the previous terminal content", () => {
      // Arrange
      const updatePreviousContent = vi.spyOn(
        TerminalUtil,
        "updatePreviousContent",
      );

      // Act
      beforeinput();

      // Assert
      expect(updatePreviousContent).toHaveBeenCalled();
    });
  });
});
