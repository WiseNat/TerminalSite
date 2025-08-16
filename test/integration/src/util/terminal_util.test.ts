import { beforeEach, describe, expect, test } from "vitest";
import TerminalUtil from "../../../../src/util/terminal_util";
import { zeroWidthSpace } from "../../../e2e/helper/constant/generic";

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

  [
    { type: "getInput", returnZeroWidth: false },
    { type: "getRawInput", returnZeroWidth: true },
  ].forEach(({ type, returnZeroWidth }) => {
    describe(type, () => {
      function getInputType(type: string): string | undefined {
        switch (type) {
          case "getInput":
            return TerminalUtil.getInput();
          case "getRawInput":
            return TerminalUtil.getRawInput();
        }

        return undefined;
      }

      test("should return the terminal content when the input element has content", async () => {
        // Arrange
        const insertedContent = "foo";
        inputElement.textContent = insertedContent;

        // Act
        const content = getInputType(type);

        // Assert
        expect(content).toBe(insertedContent);
      });

      test("should return an empty string when the input element has no content", async () => {
        // Arrange & Act
        const content = getInputType(type);

        // Assert
        expect(content).not.toBeNull();
        expect(content).toBe("");
      });

      test("should normalise spaces when they are present in the input element", async () => {
        // Arrange
        inputElement.innerHTML = "FOO&nbsp;BAR&nbsp;BAZ";

        // Act
        const content = getInputType(type);

        // Assert
        expect(content).not.toBeNull();
        expect(content).toBe("FOO BAR BAZ");
      });

      test(`should ${returnZeroWidth ? "" : "not "}return a zero-width space`, async () => {
        // Arrange
        const insertedContent = zeroWidthSpace;
        inputElement.textContent = insertedContent;

        // Act
        const content = getInputType(type);

        // Assert
        if (returnZeroWidth) {
          expect(content).toBe(insertedContent);
        } else {
          expect(content).toBe("");
        }
      });
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

    test("should set text in the input element as a zero-width space when an empty string is provided", async () => {
      // Arrange
      const text = "";
      inputElement.textContent = "bar";

      // Act
      TerminalUtil.setInput(text);

      // Assert
      expect(inputElement.textContent).toBe(zeroWidthSpace);
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

    test("should set instead of append the input if the current input is a zero-width space", async () => {
      // Arrange
      const appendedText = "bar";
      inputElement.textContent = zeroWidthSpace;

      // Act
      TerminalUtil.appendInput(appendedText);

      // Assert
      expect(inputElement.textContent).toBe(appendedText);
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
  describe("getRawOutput", () => {
    test("should return the output element content when the output element has content", async () => {
      // Arrange
      const insertedContent = "foo";
      outputElement.textContent = insertedContent;

      // Act
      const content = TerminalUtil.getRawOutput();

      // Assert
      expect(content).toBe(insertedContent);
    });

    test("should return an empty string when the output element has no content", async () => {
      // Arrange & Act
      const content = TerminalUtil.getRawOutput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("");
    });

    test("should normalise spaces when they are present in the output element", async () => {
      // Arrange
      outputElement.innerHTML = "FOO&nbsp;BAR&nbsp;BAZ";

      // Act
      const content = TerminalUtil.getRawOutput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe("FOO BAR BAZ");
    });

    test("should return non-escaped HTML specific characters when a nested HTML element exists within the output element", async () => {
      // Arrange
      outputElement.innerHTML =
        "TEST<a href='https://nathanwise.tech'>&gt;asdas das&lt;</a>ING";

      // Act
      const content = TerminalUtil.getRawOutput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe(
        "TEST<a href=\"https://nathanwise.tech\">&gt;asdas das&lt;</a>ING",
      );
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

    test("should return non-escaped HTML specific characters when a nested HTML element exists within the output element", async () => {
      // Arrange
      outputElement.innerHTML =
        "TEST<a href='https://nathanwise.tech'>&gt;asdas das&lt;</a>ING";

      // Act
      const content = TerminalUtil.getOutput();

      // Assert
      expect(content).not.toBeNull();
      expect(content).toBe(
        "TEST<a href=\"https://nathanwise.tech\">>asdas das<</a>ING",
      );
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

    test("should escape HTML specific characters when setting text in the output element", async () => {
      const text = "TEST<a href='https://nathanwise.tech'>example</a>ING";

      // Act
      TerminalUtil.setOutput(text);

      // Assert
      expect(outputElement.textContent).toBe(text);

      const escapedText =
        "TEST&lt;a href='https://nathanwise.tech'&gt;example&lt;/a&gt;ING";
      expect(outputElement.innerHTML).toBe(escapedText);
    });
  });
  describe("setRawOutput", () => {
    test("should set text in the output element when the output element was previously empty", async () => {
      // Arrange
      const text = "foo";

      // Act
      TerminalUtil.setRawOutput(text);

      // Assert
      expect(outputElement.textContent).toBe(text);
    });

    test("should set text in the output element when the output element had content", async () => {
      // Arrange
      const text = "foo";
      outputElement.textContent = "bar";

      // Act
      TerminalUtil.setRawOutput(text);

      // Assert
      expect(outputElement.textContent).toBe(text);
    });

    test("should escape HTML specific characters when setting text in the output element", async () => {
      const text = "TEST<a href='https://nathanwise.tech'>example</a>ING";

      // Act
      TerminalUtil.setRawOutput(text);

      // Assert
      const onlyText = "TESTexampleING";
      expect(outputElement.textContent).toBe(onlyText);
      expect(outputElement.innerHTML).toBe(text.replace(/'/g, "\""));
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

    test("should append a newline if text exists in the output", () => {
      // Arrange
      const existingText = "foo";
      const appendedText = "bar";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendOutput(appendedText, true);

      // Assert
      expect(outputElement.textContent).toBe(
        `${existingText}\n${appendedText}`,
      );
    });

    test("should not append a newline if text does not exist in the output", () => {
      // Arrange
      const existingText = "";
      const appendedText = "bar";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendOutput(appendedText, true);

      // Assert
      expect(outputElement.textContent).toBe(`${existingText}${appendedText}`);
    });

    test("should escape HTML specific characters when appending text to the output element", async () => {
      // Arrange
      const existingText = "foo";
      const appendedText =
        "TEST<a href='https://nathanwise.tech'>example</a>ING";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendOutput(appendedText);

      // Assert
      expect(outputElement.textContent).toBe(existingText + appendedText);

      const escapedText =
        "TEST&lt;a href='https://nathanwise.tech'&gt;example&lt;/a&gt;ING";
      expect(outputElement.innerHTML).toBe(existingText + escapedText);
    });
  });
  describe("appendRawOutput", () => {
    test("should append text to the output element", async () => {
      // Arrange
      const existingText = "foo";
      const appendedText = "bar";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendRawOutput(appendedText);

      // Assert
      expect(outputElement.textContent).toBe(existingText + appendedText);
    });

    test("should append a newline if text exists in the output", () => {
      // Arrange
      const existingText = "foo";
      const appendedText = "bar";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendRawOutput(appendedText, true);

      // Assert
      expect(outputElement.textContent).toBe(
        `${existingText}\n${appendedText}`,
      );
    });

    test("should not append a newline if text does not exist in the output", () => {
      // Arrange
      const existingText = "";
      const appendedText = "bar";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendRawOutput(appendedText, true);

      // Assert
      expect(outputElement.textContent).toBe(`${existingText}${appendedText}`);
    });

    test("should escape HTML specific characters when appending text to the output element", async () => {
      // Arrange
      const existingText = "foo";
      const appendedText =
        "TEST<a href='https://nathanwise.tech'>example</a>ING";
      outputElement.textContent = existingText;

      // Act
      TerminalUtil.appendRawOutput(appendedText);

      // Assert
      const onlyText = "TESTexampleING";
      expect(outputElement.textContent).toBe(existingText + onlyText);

      expect(outputElement.innerHTML).toBe(
        existingText + appendedText.replace(/'/g, "\""),
      );
    });
  });
});

// Can't test "cursorToEnd" effectively with JSDom - rely on E2E to test this
// Can't test "cursorToIndex" effectively with JSDom - rely on E2E to test this
