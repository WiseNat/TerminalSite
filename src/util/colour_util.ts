import { FileTreeNode } from "virtual:file-tree";
import { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED } from "../constant/colour.ts";
import FileSystemUtil from "./file_system_util.ts";

export interface Style {
  foreground: string | null;
  background: string | null;
  fontWeight: string | null;
}

export default class ColourUtil {
  /**
   * Gets the CSS Styling information for the given {@link FileTreeNode}. Styling includes colours for the foreground &
   * background alongside font weighting.
   * <p>
   * This is equivalent to `LS_COLORS` in a Linux terminal.
   *
   * @param node the file/dir entry to get the CSS styling for.
   */
  public static getFileSystemEntryStyle(node: FileTreeNode): Style {
    let foreground: string | null = null;
    const background: string | null = null;
    let fontWeight: string | null = null;

    if (node.isDirectory) {
      foreground = BLUE;
      fontWeight = "bold";
    } else if (FileSystemUtil.isExecutable(node.permissions)) {
      foreground = GREEN;
      fontWeight = "bold";
    } else if (FileSystemUtil.isArchiveFile(node.name)) {
      foreground = RED;
      fontWeight = "bold";
    } else if (FileSystemUtil.isGraphicsFile(node.name)) {
      foreground = MAGENTA;
      fontWeight = "bold";
    } else if (FileSystemUtil.isAudioFile(node.name)) {
      foreground = CYAN;
      fontWeight = "bold";
    } else if (FileSystemUtil.isRubbishFile(node.name)) {
      foreground = BLACK;
    }

    return {
      foreground: foreground,
      background: background,
      fontWeight: fontWeight,
    };
  }
}
