// TODO: Migrate events to separate files?
// TODO: Proper E2E testing with Selenium/Playwright/Cypress

const terminal = document.getElementById("terminal")!;

const initialPrompt =
  "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n";
const prompt = "C:\\Users\\user>";

// TODO: Call TerminalUtil.appendText(text) instead
terminal.innerHTML += initialPrompt + "\n" + prompt;

// TODO: Update this when commands are processed
const readonlyIndex = terminal.innerText.length;

let contentBeforeInput = "";
let previousEvent: string;

// TODO: Move to util
// Moves cursor to the end of the element
function cursorToEnd() {
  const selection = window.getSelection()!;
  const range = document.createRange();
  selection.removeAllRanges();
  range.selectNodeContents(terminal);
  range.collapse(false);
  selection.addRange(range);
  terminal.focus();
}

terminal.addEventListener("paste", (event) => {
  event.preventDefault();

  contentBeforeInput = terminal.innerText;

  // Deprecated though no good alternatives exist for pasting with proper undo history.
  // When `contenteditable="plaintext-only"` becomes more mainstream, this can be removed.
  const text = event.clipboardData?.getData("text/plain") ?? "";
  document.execCommand("insertText", false, text);

  previousEvent = "paste";
});

terminal.addEventListener("beforeinput", () => {
  // TODO: Is this needed?
  if (previousEvent !== "paste") {
    contentBeforeInput = terminal.innerText;
  }

  previousEvent = "beforeinput";
});

terminal.addEventListener("input", (event) => {
  const contentAfterInput = terminal.innerText;

  // Check the readonly terminal sections match
  const validInput =
    contentBeforeInput.substring(0, readonlyIndex) ==
    contentAfterInput.substring(0, readonlyIndex);

  if (!validInput) {
    const inputEvent = event as InputEvent;

    // The following should never be null according to the spec: https://w3c.github.io/input-events/#overview
    const data =
      inputEvent.data ?? inputEvent.dataTransfer?.getData("text/plain") ?? "";

    // TODO: Change to TerminalUtil.setText(text) & TerminalUtil.appendText(text) calls
    // Reset to previous content and append user-inputted data to the end of the input
    terminal.innerText = contentBeforeInput;
    terminal.innerText += data;
    cursorToEnd();
  }

  previousEvent = "input";
});
