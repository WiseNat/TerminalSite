import { describe, test } from "vitest";
import { processTab } from "../../../../src/event/keydown/tab";

describe("Tab", () => {
  // TODO: implement tests
  test.todo("Autocompletes a command name when typing a command", () => {
    // Arrange
    const event = new KeyboardEvent("keydown");

    // Act
    processTab(event);

    // Assert
    // TODO: ????
  });

  test.todo(
    "Passes autocompletion to the owning command when a command has been typed",
  );

  // TODO: Implement this when working directories is added
  test.todo(
    "Defaults to file autocompletion when a command that does not exist is typed",
  );
});
