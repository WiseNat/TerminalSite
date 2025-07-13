import { describe, expect, test, vi } from "vitest";
import { keydown } from "../../../../src/event/keydown";
import * as enterModule from "../../../../src/event/keydown_key/enter";
import * as tabModule from "../../../../src/event/keydown_key/tab";
import * as arrowUpModule from "../../../../src/event/keydown_key/arrow_up";
import * as arrowDownModule from "../../../../src/event/keydown_key/arrow_down";
import * as endModule from "../../../../src/event/keydown_key/end";
import * as homeModule from "../../../../src/event/keydown_key/home";

describe("Keydown Event", () => {
  describe("keydown", () => {
    // Spy
    const processEnter = vi.spyOn(enterModule, "processEnter");
    const processTab = vi.spyOn(tabModule, "processTab");
    const processArrowUp = vi.spyOn(arrowUpModule, "processArrowUp");
    const processArrowDown = vi.spyOn(arrowDownModule, "processArrowDown");
    const processEnd = vi.spyOn(endModule, "processEnd");
    const processHome = vi.spyOn(homeModule, "processHome");

    // Mock
    vi.mock("../../../../src/event/keydown_key/enter");
    vi.mock("../../../../src/event/keydown_key/tab");
    vi.mock("../../../../src/event/keydown_key/arrow_up");
    vi.mock("../../../../src/event/keydown_key/arrow_down");
    vi.mock("../../../../src/event/keydown_key/end");
    vi.mock("../../../../src/event/keydown_key/home");

    // Other
    const functions = [
      processEnter,
      processTab,
      processArrowUp,
      processArrowDown,
      processEnd,
      processHome,
    ];

    test.each([
      { key: "Enter", expected: processEnter },
      { key: "Tab", expected: processTab },
      { key: "ArrowUp", expected: processArrowUp },
      { key: "ArrowDown", expected: processArrowDown },
      { key: "End", expected: processEnd },
      { key: "Home", expected: processHome },
    ])("calls correct function when '$key' is pressed", ({ key, expected }) => {
      // Arrange
      const event = new KeyboardEvent("keydown", { key });

      // Act
      keydown(event);

      // Assert
      expect(expected).toHaveBeenCalled();

      for (const fn of functions) {
        if (fn !== expected) {
          expect(fn).not.toHaveBeenCalled();
        }
      }
    });
  });
});
