import { describe, expect, test, vi } from "vitest";
import { keydown } from "../../../../../src/event/keydown/keydown";
import * as enterModule from "../../../../../src/event/keydown/enter";
import * as tabModule from "../../../../../src/event/keydown/tab";

describe("Keydown Event", () => {
  describe("keydown", () => {
    // Spy
    const processEnter = vi.spyOn(enterModule, "processEnter");
    const processTab = vi.spyOn(tabModule, "processTab");

    // Mock
    vi.mock("../../../../../src/event/keydown/enter");
    vi.mock("../../../../../src/event/keydown/tab");

    test("calls processEnter when 'Enter' is pressed", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
      });

      // Act
      keydown(event);

      // Assert
      expect(processEnter).toHaveBeenCalledOnce();
      expect(processTab).not.toHaveBeenCalled();
    });

    test("calls processTab when 'Tab' is pressed", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
      });

      // Act
      keydown(event);

      // Assert
      expect(processEnter).not.toHaveBeenCalledOnce();
      expect(processTab).toHaveBeenCalledOnce();
    });
  });
});
