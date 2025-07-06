import { describe, expect, test, vi } from "vitest";
import { keydown } from "../../../../../src/event/keydown/keydown";
import * as enterModule from "../../../../../src/event/keydown/enter";
import * as tabModule from "../../../../../src/event/keydown/tab";
import * as arrowUpModule from "../../../../../src/event/keydown/arrow_up";
import * as arrowDownModule from "../../../../../src/event/keydown/arrow_down";

describe("Keydown Event", () => {
  describe("keydown", () => {
    // Spy
    const processEnter = vi.spyOn(enterModule, "processEnter");
    const processTab = vi.spyOn(tabModule, "processTab");
    const processArrowUp = vi.spyOn(arrowUpModule, "processArrowUp");
    const processArrowDown = vi.spyOn(arrowDownModule, "processArrowDown");

    // Mock
    vi.mock("../../../../../src/event/keydown/enter");
    vi.mock("../../../../../src/event/keydown/tab");
    vi.mock("../../../../../src/event/keydown/arrow_up");
    vi.mock("../../../../../src/event/keydown/arrow_down");

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
      expect(processArrowUp).not.toHaveBeenCalled();
      expect(processArrowDown).not.toHaveBeenCalled();
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
      expect(processArrowUp).not.toHaveBeenCalled();
      expect(processArrowDown).not.toHaveBeenCalled();
    });

    test("calls processArrowUp when 'ArrowUp' is pressed", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        key: "ArrowUp",
      });

      // Act
      keydown(event);

      // Assert
      expect(processEnter).not.toHaveBeenCalledOnce();
      expect(processTab).not.toHaveBeenCalledOnce();
      expect(processArrowUp).toHaveBeenCalled();
      expect(processArrowDown).not.toHaveBeenCalled();
    });

    test("calls processArrowDown when 'ArrowDown' is pressed", () => {
      // Arrange
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
      });

      // Act
      keydown(event);

      // Assert
      expect(processEnter).not.toHaveBeenCalledOnce();
      expect(processTab).not.toHaveBeenCalledOnce();
      expect(processArrowUp).not.toHaveBeenCalled();
      expect(processArrowDown).toHaveBeenCalled();
    });
  });
});
