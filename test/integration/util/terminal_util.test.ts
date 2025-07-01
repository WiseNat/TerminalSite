import { beforeEach, describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../src/util/terminal_util";

describe("TerminalUtil", () => {
  let terminal: HTMLElement;

  beforeEach(() => {
    // Mock terminal element
    document.body.innerHTML =
      "<div id=\"terminal\" contenteditable=\"true\"></div>";

    terminal = document.getElementById("terminal")!;
  });

  describe("getTerminal", () => {
    test("should return the terminal", async () => {
      const terminal = TerminalUtil.getTerminal();

      expect(terminal).not.toBeNull();
    });
  });

  describe("getTerminalContent", () => {
    test("should return the terminal content when the terminal has content", async () => {
      const insertedContent = "foo";
      terminal.textContent = insertedContent;

      const content = TerminalUtil.getTerminalContent();

      expect(content).toBe(insertedContent);
    });

    test("should return an empty string when the terminal has no content", async () => {
      const content = TerminalUtil.getTerminalContent();

      expect(content).not.toBeNull();
      expect(content).toBe("");
    });
  });

  describe("setText", () => {
    test("should set text in the terminal when the terminal was previously empty", async () => {
      const text = "foo";

      TerminalUtil.setText(text);

      expect(terminal.textContent).toBe(text);
    });

    test("should set text in the terminal when the terminal had content", async () => {
      const text = "foo";
      terminal.textContent = "bar";

      TerminalUtil.setText(text);

      expect(terminal.textContent).toBe(text);
    });

    test("should move the cursor to the end of the terminal", async () => {
      const cursorToEnd = vi.spyOn(TerminalUtil, "cursorToEnd");

      TerminalUtil.setText("foo");

      expect(cursorToEnd).toHaveBeenCalled();
    });
  });

  describe("appendText", () => {
    test("should append text to the terminal", async () => {
      const existingText = "foo";
      const appendedText = "bar";
      terminal.textContent = existingText;

      TerminalUtil.appendText(appendedText);

      expect(terminal.textContent).toBe(existingText + appendedText);
    });

    test("should move the cursor to the end of the terminal", async () => {
      const cursorToEnd = vi.spyOn(TerminalUtil, "cursorToEnd");

      TerminalUtil.appendText("foo");

      expect(cursorToEnd).toHaveBeenCalled();
    });
  });

  // Can't test effectively with JSDom - rely on E2E to test this
  // describe("cursorToEnd", () => {
  // });
});
