import { test, describe, vi, expect } from "vitest";
import TerminalUtil from "../../../src/util/terminal_util";
import { beforeinput } from "../../../src/event/beforeinput";

describe("Before Input Event", () => {
  vi.mock("../../../src/util/terminal_util");

  describe("beforeinput", () => {
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
