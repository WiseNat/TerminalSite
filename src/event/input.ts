import TerminalUtil from "../util/terminal_util.ts";

/**
 * Event listener function for preventing read-only text modification on inputs to the terminal.
 *
 * @param event event listener {@link Event}
 */
export function input(event: Event) {
  const inputEvent = event as InputEvent;
  const previousContent = TerminalUtil.getPreviousContent();
  const currentReadOnlyContent = TerminalUtil.getReadOnlyContent();

  // Check if the read-only terminal sections do not match
  if (
    TerminalUtil.getReadOnlyContent(previousContent) != currentReadOnlyContent
  ) {
    const data = getInsertedDataFromInputEvent(inputEvent);

    // Reset to previous content and append user-inputted data to the end of the input
    TerminalUtil.setText(previousContent + data);
  } else if (
    inputEvent.inputType === "insertLineBreak" ||
    inputEvent.inputType === "insertParagraph"
  ) {
    // Safe-guarding against uncaught newlines - should trigger for all browsers except Firefox

    const innerText = TerminalUtil.getTerminal().innerText;

    if (TerminalUtil.getReadOnlyContent(innerText) != currentReadOnlyContent) {
      // Reset to previous content and append newline to the end of the input
      // Carriage returns ("\r") will be treated as newlines
      TerminalUtil.setText(previousContent + "\n");
    }
  }
}

/**
 * Retrieves the inserted data safely from the provided {@link InputEvent}.
 * Uses the following spec: https://w3c.github.io/input-events/#overview
 *
 * @param inputEvent event to pull the data from
 */
function getInsertedDataFromInputEvent(inputEvent: InputEvent) {
  // Newlines are inexplicably excluded from data and dataTransfer
  if (inputEvent.inputType === "insertLineBreak") {
    return "\n";
  }

  return (
    inputEvent.data ?? inputEvent.dataTransfer?.getData("text/plain") ?? ""
  );
}
