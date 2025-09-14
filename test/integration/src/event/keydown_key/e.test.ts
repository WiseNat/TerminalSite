import { describe, expect, test, vi } from "vitest";
import * as endModule from "../../../../../src/event/keydown_key/end";
import { processE } from "../../../../../src/event/keydown_key/e";

describe("E", () => {
  // Spy
  const processEnd = vi.spyOn(endModule, "processEnd");

  // Mock
  vi.mock("../../../../../src/event/keydown_key/end");

  describe("processE", () => {
    test("with 'Ctrl' moves the cursor to the end of the user input", async () => {
      // Arrange
      const event = new KeyboardEvent("keydown", { ctrlKey: true });

      // Act
      await processE(event);

      // Assert
      expect(processEnd).toHaveBeenCalledOnce();
    });

    test("without 'Ctrl' does nothing", async () => {
      // Arrange
      const event = new KeyboardEvent("keydown");

      // Act
      await processE(event);

      // Assert
      expect(processEnd).not.toHaveBeenCalled();
    });
  });
});
