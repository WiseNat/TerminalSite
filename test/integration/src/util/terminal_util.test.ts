import { beforeEach, describe, expect, test } from "vitest";
import TerminalUtil from "../../../../src/util/terminal_util";

let inputElement: HTMLElement;
let promptElement: HTMLElement;
let outputElement: HTMLElement;

beforeEach(() => {
  // Mock terminal elements
  document.body.innerHTML =
    "<div id=\"input\" contenteditable=\"true\"></div>" +
    "<div id=\"prompt\"></div>" +
    "<div id=\"output\"></div>";

  inputElement = document.getElementById("input")!;
  promptElement = document.getElementById("prompt")!;
  outputElement = document.getElementById("output")!;
});

describe("Input", () => {
  describe("getInputElement", () => {
    test("should return the terminal", async () => {
      // Arrange & Act
      const element = TerminalUtil.getInputElement();

      // Assert
      expect(element).not.toBeNull();
    });
  });
  describe("getInput", () => {
    test("should return the terminal content when the input element has content", async () => {
      // Arrange
      const insertedContent = "foo";
      inputElement.textContent = insertedContent;

      // Act
      const content = TerminalUtil.getInput();

      // Assert
      expect(content).toBe(insertedContent);
    });

    test("should return an empty string when the input element has no content", async () => {
      // Arrange & Act
      const content = TerminalUtil.getInput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("");
    });

    test("should normalise spaces when they are present in the input element", async () => {
      // Arrange
      inputElement.innerHTML = "FOO&nbsp;BAR&nbsp;BAZ";

      // Act
      const content = TerminalUtil.getInput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("FOO BAR BAZ");
    });
  });
  describe("setInput", () => {
    test("should set text in the input element when the input element was previously empty", async () => {
      // Arrange
      const text = "foo";

      // Act
      TerminalUtil.setInput(text);

      // Assert
      expect(inputElement.textContent).toBe(text);
    });

    test("should set text in the input element when the input element had content", async () => {
      // Arrange
      const text = "foo";
      inputElement.textContent = "bar";

      // Act
      TerminalUtil.setInput(text);

      // Assert
      expect(inputElement.textContent).toBe(text);
    });
  });
  describe("appendInput", () => {
    test("should append text to the input element", async () => {
      // Arrange
      const existingText = "foo";
      const appendedText = "bar";
      inputElement.textContent = existingText;

      // Act
      TerminalUtil.appendInput(appendedText);

      // Assert
      expect(inputElement.textContent).toBe(existingText + appendedText);
    });
  });
});

describe("Prompt", () => {
  describe("getPromptElement", () => {
    test("should return the prompt element", async () => {
      // Arrange & Act
      const element = TerminalUtil.getPromptElement();

      // Assert
      expect(element).not.toBeNull();
    });
  });
  describe("getPrompt", () => {
    test("should return the prompt element content when the prompt element has content", async () => {
      // Arrange
      const insertedContent = "foo";
      promptElement.textContent = insertedContent;

      // Act
      const content = TerminalUtil.getPrompt();

      // Assert
      expect(content).toBe(insertedContent);
    });

    test("should return an empty string when the prompt element has no content", async () => {
      // Arrange & Act
      const content = TerminalUtil.getPrompt();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("");
    });

    test("should normalise spaces when they are present in the prompt element", async () => {
      // Arrange
      promptElement.innerHTML = "FOO&nbsp;BAR&nbsp;BAZ";

      // Act
      const content = TerminalUtil.getPrompt();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("FOO BAR BAZ");
    });
  });
  describe("setPrompt", () => {
    test("should set text in the prompt element when the prompt element was previously empty", async () => {
      // Arrange
      const text = "foo";

      // Act
      TerminalUtil.setPrompt(text);

      // Assert
      expect(promptElement.textContent).toBe(text);
    });

    test("should set text in the prompt element when the prompt element had content", async () => {
      // Arrange
      const text = "foo";
      promptElement.textContent = "bar";

      // Act
      TerminalUtil.setPrompt(text);

      // Assert
      expect(promptElement.textContent).toBe(text);
    });
  });
  describe("appendPrompt", () => {
    test("should append text to the prompt element", async () => {
      // Arrange
      const existingText = "foo";
      const appendedText = "bar";
      promptElement.textContent = existingText;

      // Act
      TerminalUtil.appendPrompt(appendedText);

      // Assert
      expect(promptElement.textContent).toBe(existingText + appendedText);
    });
  });
});

describe("Output", () => {
  describe("getOutputElement", () => {
    test("should return the output element", async () => {
      // Arrange & Act
      const element = TerminalUtil.getOutputElement();

      // Assert
      expect(element).not.toBeNull();
    });
  });
  describe("getOutput", () => {
    test("should return the output element content when the output element has content", async () => {
      // Arrange
      const insertedContent = "foo";
      outputElement.textContent = insertedContent;

      // Act
      const content = TerminalUtil.getOutput();

      // Assert
      expect(content).toBe(insertedContent);
    });

    test("should return an empty string when the output element has no content", async () => {
      // Arrange & Act
      const content = TerminalUtil.getOutput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("");
    });

    test("should normalise spaces when they are present in the output element", async () => {
      // Arrange
      outputElement.innerHTML = "FOO&nbsp;BAR&nbsp;BAZ";

      // Act
      const content = TerminalUtil.getOutput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("FOO BAR BAZ");
    });
  });
  describe("setOutput", () => {
    test("should set text in the output element when the output element was previously empty", async () => {
      // Arrange
      const text = "foo";

      // Act
      TerminalUtil.setOutput(text);

      // Assert
      expect(outputElement.textContent).toBe(text);
    });

    test("should set text in the output element when the output element had content", async () => {
      // Arrange
      const text = "foo";
      outputElement.textContent = "bar";

      // Act
      TerminalUtil.setOutput(text);

      // Assert
      expect(outputElement.textContent).toBe(text);
    });
  });
  describe("appendOutput", () => {
    test("should append text to the output element", async () => {
      // Arrange
      const existingText = "foo";
      const appendedText = "bar";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendOutput(appendedText);

      // Assert
      expect(outputElement.textContent).toBe(existingText + appendedText);
    });
  });
});

// Can't test "cursorToEnd" effectively with JSDom - rely on E2E to test this
// Can't test "cursorToIndex" effectively with JSDom - rely on E2E to test this
