import { describe, test, expect, vi } from "vitest";
import { processA } from "../../../../../src/event/keydown_key/a";
import * as homeModule from "../../../../../src/event/keydown_key/home";

describe("A", () => {
  describe("processA", async () => {
    // Spy
    const processHome = vi.spyOn(homeModule, "processHome");

    // Mock
    vi.mock("../../../../../src/event/keydown_key/home");

    test("with 'Ctrl' moves the cursor to the start of the user input", async () => {
      // Arrange
      const event = new KeyboardEvent("keydown", { ctrlKey: true });

      // Act
      await processA(event);

      // Assert
      expect(processHome).toHaveBeenCalledOnce();
    });

    test("without 'Ctrl' does nothing", async () => {
      // Arrange
      const event = new KeyboardEvent("keydown");

      // Act
      await processA(event);

      // Assert
      expect(processHome).not.toHaveBeenCalled();
    });
  });
});
