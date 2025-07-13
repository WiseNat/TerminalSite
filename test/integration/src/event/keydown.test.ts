import { describe, expect, test, vi } from "vitest";
import { keydown } from "../../../../src/event/keydown";
import * as enterModule from "../../../../src/event/keydown_key/enter";
import * as tabModule from "../../../../src/event/keydown_key/tab";
import * as arrowUpModule from "../../../../src/event/keydown_key/arrow_up";
import * as arrowDownModule from "../../../../src/event/keydown_key/arrow_down";
import * as endModule from "../../../../src/event/keydown_key/end";
import * as homeModule from "../../../../src/event/keydown_key/home";
import * as aModule from "../../../../src/event/keydown_key/a";
import * as eModule from "../../../../src/event/keydown_key/e";

describe("Keydown Event", () => {
  describe("keydown", () => {
    // Spy
    const processA = vi.spyOn(aModule, "processA");
    const processArrowDown = vi.spyOn(arrowDownModule, "processArrowDown");
    const processArrowUp = vi.spyOn(arrowUpModule, "processArrowUp");
    const processE = vi.spyOn(eModule, "processE");
    const processEnd = vi.spyOn(endModule, "processEnd");
    const processEnter = vi.spyOn(enterModule, "processEnter");
    const processHome = vi.spyOn(homeModule, "processHome");
    const processTab = vi.spyOn(tabModule, "processTab");

    // Mock
    vi.mock("../../../../src/event/keydown_key/a");
    vi.mock("../../../../src/event/keydown_key/arrow_down");
    vi.mock("../../../../src/event/keydown_key/arrow_up");
    vi.mock("../../../../src/event/keydown_key/e");
    vi.mock("../../../../src/event/keydown_key/end");
    vi.mock("../../../../src/event/keydown_key/enter");
    vi.mock("../../../../src/event/keydown_key/home");
    vi.mock("../../../../src/event/keydown_key/tab");

    // Other
    const functions = [
      processA,
      processArrowDown,
      processArrowUp,
      processE,
      processEnd,
      processEnter,
      processHome,
      processTab,
    ];

    test.each([
      { key: "a", expected: processA },
      { key: "A", expected: processA },
      { key: "ArrowDown", expected: processArrowDown },
      { key: "ArrowUp", expected: processArrowUp },
      { key: "e", expected: processE },
      { key: "E", expected: processE },
      { key: "End", expected: processEnd },
      { key: "Enter", expected: processEnter },
      { key: "Home", expected: processHome },
      { key: "Tab", expected: processTab },
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
