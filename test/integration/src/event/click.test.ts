import { beforeEach, describe, expect, MockInstance, test, vi } from "vitest";
import TerminalUtil from "../../../../src/util/terminal_util";
import { click } from "../../../../src/event/click";

describe("Click Event", () => {
  // Spy
  const cursorToEnd = vi.spyOn(TerminalUtil, "cursorToEnd");
  let focus: MockInstance<(options?: FocusOptions) => void>;

  // Other
  let inputElement: HTMLElement;

  beforeEach(() => {
    // Mock terminal elements
    document.body.innerHTML =
      "<div id=\"input\" contenteditable=\"true\"></div>" +
      "<div id=\"prompt\"></div>" +
      "<div id=\"output\"></div>";

    inputElement = document.getElementById("input")!;

    focus = vi.spyOn(inputElement, "focus");
  });

  describe("click", () => {
    test("should focus the 'input' element if any other element is clicked", () => {
      // Arrange
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", {
        value: document.createElement("div"),
      });

      // Act
      click(event);

      // Assert
      expect(cursorToEnd).toHaveBeenCalledOnce();
      expect(focus).toHaveBeenCalledOnce();
    });

    test("should do nothing if the 'input' element is clicked", () => {
      // Arrange
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", {
        value: inputElement,
      });

      // Act
      click(event);

      // Assert
      expect(cursorToEnd).not.toHaveBeenCalled();
      expect(focus).not.toHaveBeenCalled();
    });
  });
});
