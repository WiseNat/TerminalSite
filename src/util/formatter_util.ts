import { FileTreeNode } from "virtual:file-tree";
import { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED } from "../constant/colour.ts";
import FileSystemUtil from "./file_system_util.ts";
import CssUtil from "./css_util.ts";
import TerminalUtil from "./terminal_util.ts";

export interface FileSystemEntryStyle {
  foreground: string | null;
  background: string | null;
  fontWeight: string | null;
}

export interface GridElement {
  visual: string;
  actual: string;
}

export default class FormatterUtil {
  /**
   * Gets a file system entry in HTML for the provided `node`.
   *
   * @param node the file/dir entry to get the HTML element for.
   * @param useShortName whether to use a short name or not for the file name.
   * @see FormatterUtil.getFileSystemEntryStyle
   * @returns a coloured span for the given `node`.
   */
  public static getFileSystemEntry(
    node: FileTreeNode,
    useShortName: boolean,
  ): string {
    const style = FormatterUtil.getFileSystemEntryStyle(node);

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
  public static getFileSystemEntryStyle(
    node: FileTreeNode,
  ): FileSystemEntryStyle {
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
  private static createStyleString(style: FileSystemEntryStyle) {
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

  /**
   * Converts to provided `items` into a grid that has a shape based on the
   * current size of the terminal output element and the contents of the items.
   * <p>
   * This arranges elements into white-space padded columns and rows where
   * elements are ordered column by column.
   * <p>
   * The `visual` argument of each item is used to determine the width of the
   * item whilst the `actual` argument represents it's actual size. This allows
   * for distinguishing between visual and non-visual content such as with HTML
   * elements.
   *
   * @param items
   * @param paddingSize
   */
  public static toDynamicGrid(
    items: GridElement[],
    paddingSize: number = 2,
  ): string {
    if (!items || items.length === 0) {
      return "";
    }

    const outputElement = TerminalUtil.getOutputElement();
    const font = CssUtil.getStyle(outputElement).font;
    const charWidth = CssUtil.getCharacterWidth(font) ?? 1;
    const elementWidth = CssUtil.getElementWidth(outputElement);

    const charsPerLine = Math.max(1, Math.floor(elementWidth / charWidth));

    let chosenCols = 1;
    let chosenRows = items.length;
    let chosenColWidths: number[] = [
      Math.max(...items.map((i) => i.visual.length)),
    ];

    const maxColumns = Math.min(items.length, charsPerLine);

    // Try from max possible columns down to 1, choosing the largest amount of
    // columns that fit.
    for (let columns = maxColumns; columns >= 1; columns--) {
      const rows = Math.ceil(items.length / columns);

      const columnWidths = this.calculateColumnWidths(items, rows, columns);

      const totalWidth =
        columnWidths.reduce((a, b) => a + b, 0) +
        paddingSize * Math.max(0, columns - 1);

      if (totalWidth <= charsPerLine) {
        chosenCols = columns;
        chosenRows = rows;
        chosenColWidths = columnWidths;
        break;
      }
    }

    const grid: GridElement[][] = this.toGrid(items, chosenRows, chosenCols);

    let out = "";
    for (let row = 0; row < chosenRows; row++) {
      for (let column = 0; column < chosenCols; column++) {
        const item = grid[column][row];
        if (!item) {
          continue;
        }

        const spaces = Math.max(
          0,
          chosenColWidths[column] - item.visual.length + paddingSize,
        );

        out += item.actual + " ".repeat(spaces);
      }

      out = out.trimEnd() + "\n";
    }

    return out.trimEnd();
  }

  /**
   * Computes the column widths for a given amount of `rows` and `columns` using
   * column-major ordering in the grid.
   *
   * @param items the list of items for the grid.
   * @param rows the amount of rows for the grid.
   * @param columns the amount of columns for the grid.
   * @private
   */
  private static calculateColumnWidths(
    items: GridElement[],
    rows: number,
    columns: number,
  ) {
    const columnWidths = new Array<number>(columns).fill(0);

    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        const index = column * rows + row;

        if (index >= items.length) {
          continue;
        }

        columnWidths[column] = Math.max(
          columnWidths[column],
          items[index].visual.length,
        );
      }
    }

    return columnWidths;
  }

  /**
   * Forms a column-major ordered grid using the given amount of `rows` and
   * `columns`.
   *
   * @param items the list of items for the grid.
   * @param rows the amount of rows for the grid.
   * @param columns the amount of columns for the grid.
   * @private
   */
  private static toGrid(items: GridElement[], rows: number, columns: number) {
    const grid: GridElement[][] = Array.from({ length: columns }, () => []);

    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        const index = column * rows + row;

        if (index >= items.length) {
          continue;
        }

        grid[column].push(items[index]);
      }
    }

    return grid;
  }
}
