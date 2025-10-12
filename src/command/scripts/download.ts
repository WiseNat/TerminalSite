import { CommandScript } from "../command_script.ts";
import FileImportUtil from "../../util/file_import_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import CommandUtil from "../../util/command_util.ts";
import { HelpInformation } from "./help.ts";

const DOWNLOAD: CommandScript = {
  async run(args: string[]): Promise<void> {
    if (args.length === 0) {
      return;
    }

    if (args.length > 1) {
      TerminalUtil.appendOutput("download: Too many paths");
      return;
    }

    const filePath = args[0];
    const fileUrl = FileImportUtil.getFileUrl(filePath);

    if (fileUrl === null || !(await isUrlValid(fileUrl))) {
      const error = CommandUtil.getInvalidFilePathError(filePath, "download");
      TerminalUtil.appendOutput(error);
      return;
    }

    const fileName = filePath.split("/").at(-1)!;

    await downloadFile(fileUrl, fileName);
  },

  help(): HelpInformation | null {
    return null;
  },
};

/**
 * @param fileUrl the URL to check
 * @returns true if a 200 code is returned, false otherwise.
 */
async function isUrlValid(fileUrl: string): Promise<boolean> {
  const response = await fetch(fileUrl);

  return response.ok;
}

/**
 * Downloads the `fileUrl` onto the client's machine as a file.
 *
 * @param fileUrl url to the file that should be downloaded.
 * @param fileName prompt name of the downloaded file, this may be ignored by the browser.
 */
async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  const anchorElement = document.createElement("a");
  anchorElement.href = fileUrl;
  anchorElement.download = fileName;

  anchorElement.click();
}

// noinspection JSUnusedGlobalSymbols
export default DOWNLOAD;
