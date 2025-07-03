import { describe, expect, test, vi } from "vitest";
import { keydown } from "../../../../src/event/keydown/keydown";
import * as enterModule from "../../../../src/event/keydown/enter";

describe("Keydown Event", () => {
  describe("keydown", () => {
    // Spy
    const processEnter = vi.spyOn(enterModule, "processEnter");

    // Mock
    vi.mock("../../../../src/event/keydown/enter");

    test("calls processEnter when 'Enter' is pressed", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
      });

      // Act
      keydown(event);

      // Assert
      expect(processEnter).toHaveBeenCalledOnce();
    });
  });
});
