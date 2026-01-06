import { FileTreeNode } from "virtual:file-tree";
import FileSystemUtil from "./file_system_util.ts";
import CssUtil from "./css_util.ts";
import TerminalUtil from "./terminal_util.ts";
import HtmlUtil from "./html_util.ts";
import {
  ENTRY_FIVE,
  ENTRY_FOUR,
  ENTRY_ONE,
  ENTRY_SIX,
  ENTRY_TWO,
  ENTRY_ZERO,
} from "../constant/theme.ts";

export interface FileSystemEntryStyle {
  foreground: string | null;
  background: string | null;
  fontWeight: string | null;
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
      foreground = CssUtil.asVar(ENTRY_FOUR);
      fontWeight = "bold";
    } else if (FileSystemUtil.isExecutable(node.permissions)) {
      foreground = CssUtil.asVar(ENTRY_TWO);
      fontWeight = "bold";
    } else if (FileSystemUtil.isArchiveFile(node.name)) {
      foreground = CssUtil.asVar(ENTRY_ONE);
      fontWeight = "bold";
    } else if (FileSystemUtil.isGraphicsFile(node.name)) {
      foreground = CssUtil.asVar(ENTRY_FIVE);
      fontWeight = "bold";
    } else if (FileSystemUtil.isAudioFile(node.name)) {
      foreground = CssUtil.asVar(ENTRY_SIX);
      fontWeight = "bold";
    } else if (FileSystemUtil.isRubbishFile(node.name)) {
      foreground = CssUtil.asVar(ENTRY_ZERO);
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
  public static createStyleString(style: FileSystemEntryStyle) {
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
   * Gets the amount of characters per line for the `element`.
   * @param element the element to use to determine characters per line
   */
  public static getCharactersPerLine(element: HTMLElement): number {
    const font = CssUtil.getStyle(element).font;
    const charWidth = CssUtil.getCharacterWidth(font) ?? 1;
    const elementWidth = CssUtil.getElementWidth(element);

    return Math.max(1, Math.floor(elementWidth / charWidth));
  }

  /**
   * Converts the provided `items` into a grid that has a shape based on the
   * current size of the terminal output element, and the size of the items.
   * <p>
   * This arranges elements into white-space padded columns and rows where
   * elements are ordered column by column.
   * <p>
   * The `visual` argument of each item is used to determine the width of the
   * item whilst the `actual` argument represents it's actual size. This allows
   * for distinguishing between visual and non-visual content such as with HTML
   * elements.
   *
   * @param items the items to insert into the grid.
   * @param paddingSize the amount of extra padding between items.
   * @see toStaticColumns
   */
  public static toDynamicGrid(
    items: string[],
    paddingSize: number = 2,
  ): string {
    if (!items || items.length === 0) {
      return "";
    }

    const outputElement = TerminalUtil.getOutputElement();
    const charsPerLine = this.getCharactersPerLine(outputElement);

    let chosenCols = 1;
    let chosenRows = items.length;
    let chosenColWidths: number[] = [
      Math.max(...items.map((i) => HtmlUtil.extractVisibleText(i).length)),
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

    const grid: string[][] = this.toGrid(items, chosenRows, chosenCols);

    let out = "";
    for (let row = 0; row < chosenRows; row++) {
      for (let column = 0; column < chosenCols; column++) {
        const item = grid[column][row];
        if (!item) {
          continue;
        }

        const spaces = Math.max(
          0,
          chosenColWidths[column] -
            HtmlUtil.extractVisibleText(item).length +
            paddingSize,
        );

        out += item + " ".repeat(spaces);
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
    items: string[],
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
          HtmlUtil.extractVisibleText(items[index]).length,
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
  private static toGrid(items: string[], rows: number, columns: number) {
    const grid: string[][] = Array.from({ length: columns }, () => []);

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

  /**
   * Converts the provided `columns` into a grid of columns. Each column will be
   * split by newlines and padded so that each column is next to each other.
   * <p>
   * This is not responsive for element sizing and will visually overrun lines
   * if the total row data is larger than the maximum amount of characters for
   * a line. Usage of this method should be cautious as mobile devices may be
   * negatively impacted by its lack of responsiveness.
   * <p>
   * Usage of HTML elements must be cautious. If an HTML element exists across
   * multiple newlines, it will be split across multiple columns. To avoid this
   * make sure all HTML elements are only for a single line.
   *
   * @param columns the columns to insert into the grid.
   * @param paddingSize the amount of extra padding between columns.
   * @see toResponsiveColumns
   */
  public static toStaticColumns(columns: string[], paddingSize: number = 2) {
    if (columns.length === 0) {
      return "";
    }

    const grid: string[][] = Array.from({ length: columns.length }, () => []);
    let maximumRows = 0;
    const maximumColumnLengths: number[] = Array.from({
      length: columns.length,
    });

    for (let i = 0; i < grid.length; i++) {
      grid[i] = columns[i].split("\n");

      maximumRows = Math.max(maximumRows, grid[i].length);

      maximumColumnLengths[i] = Math.max(
        ...grid[i].map((i) => HtmlUtil.extractVisibleText(i).length),
      );
    }

    let output = "";
    for (let row = 0; row < maximumRows; row++) {
      for (let column = 0; column < grid.length; column++) {
        let columnData = grid[column][row] ?? "";

        if (column !== grid.length - 1) {
          // Potentially more performant not recalculating visible text, though
          // this would result in processing a messy data structure
          const spaces =
            maximumColumnLengths[column] +
            paddingSize -
            HtmlUtil.extractVisibleText(columnData).length;
          columnData += " ".repeat(spaces);
        }

        output += columnData;
      }

      output += "\n";
    }

    return output.trimEnd();
  }

  // TODO: JSDoc
  // TODO: Unit test
  public static toResponsiveColumns(
    columns: string[],
    paddingSize: number = 2,
    truncationChar: string = ">",
  ) {
    if (columns.length === 0) {
      return "";
    }

    const grid: string[][] = Array.from({ length: columns.length }, () => []);
    let maximumRows = 0;
    const maximumColumnLengths: number[] = Array.from({
      length: columns.length,
    });

    for (let i = 0; i < grid.length; i++) {
      grid[i] = columns[i].split("\n");

      maximumRows = Math.max(maximumRows, grid[i].length);

      maximumColumnLengths[i] = Math.max(
        ...grid[i].map((i) => HtmlUtil.extractVisibleText(i).length),
      );
    }

    const charactersPerLine = this.getCharactersPerLine(
      TerminalUtil.getOutputElement(),
    );
    const maxColumnLength = Math.floor(charactersPerLine / columns.length);
    const maxColumnLengthWithPadding =
      maxColumnLength - paddingSize - truncationChar.length;

    let output = "";
    for (let row = 0; row < maximumRows; row++) {
      for (let column = 0; column < grid.length; column++) {
        let columnData = grid[column][row] ?? "";

        if (columnData.length > maxColumnLengthWithPadding) {
          columnData =
            columnData.substring(0, maxColumnLengthWithPadding) +
            truncationChar;
        }

        if (column !== grid.length - 1) {
          // Potentially more performant not recalculating visible text, though
          // this would result in processing a messy data structure
          columnData = columnData.padEnd(
            Math.min(
              maximumColumnLengths[column] +
                paddingSize +
                truncationChar.length,
              maxColumnLength,
            ),
            " ",
          );
        }

        output += columnData;
      }

      output += "\n";
    }

    return output.trimEnd();
  }

  /**
   * Indents content and splits content across multiple lines.
   * @param content the content to indent.
   * @param indentSize the size of the indent.
   */
  public static indentContent(content: string, indentSize: number): string {
    const contentLines = content.split("\n");
    const resolvedLines: string[] = [];

    const outputElement = TerminalUtil.getOutputElement();
    const charactersPerLine = this.getCharactersPerLine(outputElement);

    for (const line of contentLines) {
      if (line.length + indentSize >= charactersPerLine) {
        const chunks = this.toChunks(line, charactersPerLine - indentSize);
        resolvedLines.push(...chunks);
      } else {
        resolvedLines.push(line);
      }
    }

    const indent = " ".repeat(indentSize);
    const lines = resolvedLines.map((line) => `${indent}${line}`);
    return lines.join("\n");
  }

  /**
   * Converts the `str` into chunks with a maximum size of `size`.
   *
   * @param str the string to convert.
   * @param size the size of the chunks.
   */
  private static toChunks(str: string, size: number): string[] {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    let start = 0;
    for (let i = 0; i < numChunks; ++i) {
      chunks[i] = str.substring(start, start + size);
      start += size;
    }

    return chunks;
  }
}
