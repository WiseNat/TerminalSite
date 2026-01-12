export default class CommandHistoryUtil {
  private static historyIndex: number = 0;
  private static history: string[] = [];

  /**
   * Gets the history index which acts as a pointer to the current location in history.
   *
   * @internal **intended to be solely used by Tests**
   */
  public static _getHistoryIndex() {
    return this.historyIndex;
  }

  /**
   * Resets the command history to be empty and resets the history index to match.
   *
   * @internal **intended to be solely used by Tests**
   */
  public static _resetHistory() {
    this.history = [];
    this.resetHistoryIndex();
  }

  /**
   * Resets the history index back to the current command.
   */
  public static resetHistoryIndex() {
    this.historyIndex = 0;
  }

  /**
   * Increments the history index, but prevents going above the maximum history.
   *
   * @returns true if the index changed, false otherwise.
   */
  public static incrementHistoryIndex(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1;
      return true;
    }

    return false;
  }

  /**
   * Decrements the history index, but prevents going under the minimum history.
   *
   * @returns true if the index changed, false otherwise.
   */
  public static decrementHistoryIndex(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1;
      return true;
    }

    return false;
  }

  /**
   * Adds a new command to the most recent part of the history.
   *
   * @param command command string to be added.
   */
  public static addToHistory(command: string) {
    this.history.unshift(command);
  }

  /**
   * @returns the entire history.
   */
  public static getHistory(): string[] {
    return this.history;
  }

  /**
   * Gets the historic command that matches the history index.
   *
   * @returns the current history command.
   */
  public static getHistoricCommand(): string {
    return this.history[this.historyIndex];
  }

  /**
   * Overwrites the historic command at the current history index.
   *
   * @param command value to overwrite to.
   */
  public static setHistoricCommand(command: string) {
    this.history[this.historyIndex] = command;
  }
}
