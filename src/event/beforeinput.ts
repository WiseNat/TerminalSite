import TerminalUtil from "../util/terminal_util.ts";

/**
 * Event listener function for updating the previous terminal content on beforeinput calls
 */
export function beforeinput() {
  TerminalUtil.updatePreviousContent();
}
