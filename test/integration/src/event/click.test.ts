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

    vi.useFakeTimers();
  });

  describe("click", () => {
    test("should focus the 'input' element if any other element is clicked", () => {
      // Arrange
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", {
        value: document.createElement("div"),
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.spyOn(globalThis, "getSelection").mockReturnValue({
        isCollapsed: true,
      });

      // Act
      click(event);
      vi.runAllTimers();

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
      vi.runAllTimers();

      // Assert
      expect(cursorToEnd).not.toHaveBeenCalled();
      expect(focus).not.toHaveBeenCalled();
    });

    test("should do nothing if text is highlighted", () => {
      // Arrange
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", {
        value: document.createElement("div"),
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.spyOn(globalThis, "getSelection").mockReturnValue({
        isCollapsed: false,
      });

      // Assert
      click(event);
      vi.runAllTimers();

      // Act
      expect(cursorToEnd).not.toHaveBeenCalled();
      expect(focus).not.toHaveBeenCalled();
    });
  });
});
