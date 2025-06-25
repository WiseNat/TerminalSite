import TerminalUtil from "../util/terminal_util.ts";

// TODO: unit test this?...

/**
 * Event listener function for preventing read-only text modification on inputs to the terminal.
 *
 * @param event event listener {@link Event}
 */
export function input(event: Event) {
  const inputEvent = event as InputEvent;
  const returnPressed =
    inputEvent.inputType === "insertLineBreak" ||
    inputEvent.inputType === "insertParagraph";

  const previousContent = TerminalUtil.getPreviousContent();
  const currentReadOnlyContent = TerminalUtil.getReadOnlyContent();

  // Check if the read-only terminal sections do not match
  if (
    TerminalUtil.getReadOnlyContent(previousContent) != currentReadOnlyContent
  ) {
    let newText = previousContent;

    // Reset to previous content and append user-inputted data to the end of the input if return was not pressed
    if (!returnPressed) {
      const data = getInsertedDataFromInputEvent(inputEvent);
      newText += data;
    }

    TerminalUtil.setText(newText);
  } else if (returnPressed) {
    TerminalUtil.setText(previousContent);
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
