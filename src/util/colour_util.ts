import { FileTreeNode } from "virtual:file-tree";
import { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED } from "../constant/colour.ts";
import FileSystemUtil from "./file_system_util.ts";

export interface Style {
  foreground: string | null;
  background: string | null;
  fontWeight: string | null;
}

export default class ColourUtil {
  // TODO: Unit tests
  /**
   * Gets a file system entry in HTML for the provided `node`.
   *
   * @param node the file/dir entry to get the HTML element for.
   * @param useShortName whether to use a short name or not for the file name.
   * @see ColourUtil.getFileSystemEntryStyle
   * @returns a coloured span for the given `node`.
   */
  public static getFileSystemEntry(
    node: FileTreeNode,
    useShortName: boolean,
  ): string {
    const style = ColourUtil.getFileSystemEntryStyle(node);

    const styleString = this.createStyleString(style);
    const path = useShortName
      ? node.name
      : FileSystemUtil.pathSeparator +
        FileSystemUtil.joinPaths(node.path, node.name);

    if (styleString === "") {
      return path;
    }

    return `<span style='${styleString}'>${path}</span>`;
  }

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

  /**
   * Creates an HTML CSS Style String for use in elements based on the provided
   * `style`.
   *
   * @param style the value to use to create the style string.
   * @returns an HTML CSS Style String.
   */
  private static createStyleString(style: Style) {
    return [
      style.foreground === null ? null : `color: ${style.foreground}`,
      style.background === null ? null : `background: ${style.background}`,
      style.fontWeight === null ? null : `font-weight: ${style.fontWeight}`,
    ]
      .filter(function (val) {
        return val !== null;
      })
      .join("; ");
  }
}
