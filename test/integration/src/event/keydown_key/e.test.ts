import { describe, test, expect, vi } from "vitest";
import * as endModule from "../../../../../src/event/keydown_key/end";
import { processE } from "../../../../../src/event/keydown_key/e";

describe("E", () => {
  describe("processE", () => {
    // Spy
    const processEnd = vi.spyOn(endModule, "processEnd");

    // Mock
    vi.mock("../../../../../src/event/keydown_key/end");

    test("with 'Ctrl' moves the cursor to the end of the user input", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", { ctrlKey: true });

      // Act
      processE(event);

      // Assert
      expect(processEnd).toHaveBeenCalledOnce();
    });

    test("without 'Ctrl' does nothing", () => {
      // Arrange
      const event = new KeyboardEvent("keydown");

      // Act
      processE(event);

      // Assert
      expect(processEnd).not.toHaveBeenCalled();
    });
  });
});
