import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import { FileTreeNode } from "virtual:file-tree";
import ColourUtil, { Style } from "../../util/colour_util.ts";
import { clone } from "lodash-es";
import CommandUtil from "../../util/command_util.ts";

interface EntryNode {
  name: string;
  path: string;
  fullPath: string;
  isDirectory: boolean;
  children: EntryNode[];
  lastModifiedTime: Date;
  size: number;
  permissions: number[];
  owner: string;
  group: string;
  hardLinks: number;
}

// TODO: Rename?
interface PathResults {
  unknownPaths: string[];
  fileEntries: EntryNode[];
  directoryEntries: EntryNode[];
}

// TODO: add all formatting flags (e.g. -a, -l, -s, -h, -1) into this!
interface FormatFlags {
  a: boolean;
  1: boolean;
}

/**
 * Processes all paths into a single {@link PathResults} object.
 * This will find and segment out the following arguments:
 * - Unknown Path Arguments
 * - File Entry Arguments
 * - Directory Entry Arguments
 * <p>
 * The above arguments will be converted into objects that are able to be
 * easily formatted a number of ways into user readable text.
 *
 * @param paths list of paths to process.
 * @returns the {@link PathResults} object.
 */
function processPaths(paths: string[]): PathResults {
  const results: PathResults = {
    unknownPaths: [],
    fileEntries: [],
    directoryEntries: [],
  };

  for (const path of paths) {
    const resolvedPathParts = FileSystemUtil.resolvePathParts(path);

    if (resolvedPathParts === null) {
      results.unknownPaths.push(path);
      continue;
    }

    const fileNode = FileSystemUtil.walkFileTree(resolvedPathParts);
    if (fileNode === null) {
      results.unknownPaths.push(FileSystemUtil.formatPath(resolvedPathParts));
      continue;
    }

    const entryNode = createEntryNode(fileNode);
    for (const child of fileNode.children ?? []) {
      const childEntryNode = createEntryNode(child);
      entryNode.children.push(childEntryNode);
    }

    if (fileNode.isDirectory) {
      results.directoryEntries.push(entryNode);
    } else {
      results.fileEntries.push(entryNode);
    }
  }

  return results;
}

/**
 * @param fileTreeNode a {@link FileTreeNode} to use to populate an {@link EntryNode}.
 * @returns a new {@link EntryNode}.
 */
function createEntryNode(fileTreeNode: FileTreeNode): EntryNode {
  let fullPath = FileSystemUtil.joinPaths(fileTreeNode.path, fileTreeNode.name);
  if (!fullPath.startsWith(FileSystemUtil.pathSeparator)) {
    fullPath = FileSystemUtil.pathSeparator + fullPath;
  }

  return {
    name: fileTreeNode.name,
    path: fileTreeNode.path,
    fullPath: fullPath,
    isDirectory: fileTreeNode.isDirectory,
    children: [],
    lastModifiedTime: fileTreeNode.lastModifiedTime,
    size: fileTreeNode.size,
    permissions: fileTreeNode.permissions,
    owner: fileTreeNode.owner,
    group: fileTreeNode.group,
    hardLinks:
      fileTreeNode.children === undefined
        ? 1
        : 1 + fileTreeNode.children.length,
  };
}

/**
 * Formats the provided {@link PathResults} into human-readable text.
 * This is structured in the following order:
 * 1. Unknown Paths (in order they were provided)
 * 2. Files (alphabetical order)
 * 3. Directories (alphabetically order segments with alphabetically ordered files)
 *
 * @param pathResults the object to format.
 * @param flags all format related flags.
 * @returns structured human-readable text.
 */
function formatPathResults(
  pathResults: PathResults,
  flags: FormatFlags,
): string {
  let output = "";

  const unknownPathOutput = formatUnknownPaths(pathResults.unknownPaths);
  if (unknownPathOutput !== "") {
    output += unknownPathOutput;
  }

  const fileEntriesOutput = formatFileEntries(pathResults.fileEntries);
  if (fileEntriesOutput !== "") {
    if (output !== "") {
      output += "\n";
    }

    output += fileEntriesOutput;
  }

  const isPreviousOutput = output !== "";
  const directoryEntriesOutput = formatDirectoryEntries(
    pathResults.directoryEntries,
    isPreviousOutput,
    flags,
  );
  if (directoryEntriesOutput !== "") {
    if (output !== "") {
      output += "\n\n";
    }

    output += directoryEntriesOutput;
  }

  return output;
}

/**
 * Formats any Unknown Paths into an error message.
 *
 * @param unknownPaths the unknown paths.
 * @returns a combination of error messages for all `unknownPaths`
 */
function formatUnknownPaths(unknownPaths: string[]): string {
  let output = "";
  for (const unknownPath of unknownPaths) {
    if (output !== "") {
      output += "\n";
    }

    output += `ls: cannot access '${unknownPath}': No such file or directory`;
  }

  return output;
}

/**
 * Formats all File Entries into a single line separated with tabs.
 * <p>
 * The final text is ordered alphabetically.
 *
 * @param fileEntries the known file entries, must only be files.
 * @returns the formatted file entries.
 */
function formatFileEntries(fileEntries: EntryNode[]): string {
  const outputs: string[] = [];
  for (const fileEntry of fileEntries) {
    outputs.push(fileEntry.fullPath);
  }

  sortPaths(outputs);

  return outputs.join("\t");
}

/**
 * Formats all Directory Entries into a blocks separated with newlines.
 * Each block will contain the files/directories immediately under the directory
 * sorted alphabetically.
 * <p>
 * If only a single Directory Entry is provided, and no previous output has been
 * formatted, the block of immediate
 * files/directories will be the only part returned.
 *
 * @param directoryEntries the known directories entries, must only be directories.
 * @param isPreviousOutput whether or not the other formatting methods (Unknown paths & File Entries) have provided an output.
 * @param flags flags for formatting.
 * @returns the formatted directory entries.
 */
function formatDirectoryEntries(
  directoryEntries: EntryNode[],
  isPreviousOutput: boolean,
  flags: FormatFlags,
) {
  const outputs: string[] = [];

  sortEntryNodes(directoryEntries);

  for (const directoryEntry of directoryEntries) {
    const directoryEntryChildren = getSortedDirectoryEntryChildren(
      directoryEntry,
      flags,
    );
    const formattedChildren: string[] = formatDirectoryEntryChildren(
      directoryEntryChildren,
      flags,
    );

    const joinChar = flags["1"] ? "\n" : "\t";

    if (directoryEntries.length === 1 && !isPreviousOutput) {
      outputs.push(`${formattedChildren.join(joinChar)}`);
    } else {
      let output = `${directoryEntry.fullPath}:`;
      if (formattedChildren.length !== 0) {
        output += `\n${formattedChildren.join(joinChar)}`;
      }

      outputs.push(output);
    }
  }

  return outputs.join("\n\n");
}

/**
 * Gets the Sorted children from the provided `directoryEntry`.
 * <p>
 * This also gets the current directory and parent directory if the `a` format
 * flag is true.
 *
 * @param directoryEntry the directory entry with children to get.
 * @param flags format flags.
 */
function getSortedDirectoryEntryChildren(
  directoryEntry: EntryNode,
  flags: FormatFlags,
): EntryNode[] {
  const children = directoryEntry.children;

  sortEntryNodes(children);

  // Add after sorting to ensure these appear first
  if (flags.a) {
    const shallowDirectoryEntryClone = clone(directoryEntry);
    shallowDirectoryEntryClone.name = ".";

    const parentPathSegments = FileSystemUtil.splitPath(directoryEntry.path);
    const parentDirectory = FileSystemUtil.walkFileTree(parentPathSegments);

    const parentEntry: EntryNode =
      parentDirectory === null
        ? shallowDirectoryEntryClone
        : createEntryNode(parentDirectory);
    parentEntry.name = "..";

    children.unshift(parentEntry);
    children.unshift(shallowDirectoryEntryClone);
  }

  return children;
}

/**
 * Sorts and Formats Directory Entry Children.
 * <p>
 * Children will be coloured based on {@link ColourUtil.getFileSystemEntryStyle}.
 *
 * @param children list of directory entry children.
 * @param flags flags for formatting.
 * @returns a list of formatted children.
 */
function formatDirectoryEntryChildren(
  children: EntryNode[],
  flags: FormatFlags,
): string[] {
  const formattedChildren: string[] = [];

  for (const child of children) {
    if (!flags.a && isDotEntry(child.name)) {
      continue;
    }

    const style = ColourUtil.getFileSystemEntryStyle({
      name: child.name,
      path: child.path,
      isDirectory: child.isDirectory,
      lastModifiedTime: child.lastModifiedTime,
      size: child.size,
      permissions: child.permissions,
      owner: child.owner,
      group: child.group,
    });

    const styleString = createStyleString(style);

    if (styleString === "") {
      formattedChildren.push(child.name);
    } else {
      formattedChildren.push(
        `<span style='${styleString}'>${child.name}</span>`,
      );
    }
  }

  return formattedChildren;
}

/**
 * Sorts EntryNodes alphabetically by their `fullPath`, ignoring any starting
 * '.' characters.
 *
 * @param nodes the nodes to sort inline.
 * @see stripLeadingDots
 */
function sortEntryNodes(nodes: EntryNode[]) {
  nodes.sort((a, b) => {
    const aString = FileSystemUtil.stripDots(a.fullPath);
    const bString = FileSystemUtil.stripDots(b.fullPath);

    return aString.localeCompare(bString);
  });
}

/**
 * Sorts paths alphabetically, ignoring any starting '.' characters.
 *
 * @param paths the paths to sort inline.
 * @see stripLeadingDots
 */
function sortPaths(paths: string[]) {
  paths.sort((a, b) => {
    a = FileSystemUtil.stripDots(a);
    b = FileSystemUtil.stripDots(b);

    return a.localeCompare(b);
  });
}

/**
 * @param name the file name to check
 * @returns true if the file is a dot-file or dot-directory, false otherwise.
 */
function isDotEntry(name: string): boolean {
  return name.startsWith(".");
}

/**
 * Creates an HTML CSS Style String for use in elements based on the provided
 * `style`.
 *
 * @param style the value to use to create the style string.
 * @returns an HTML CSS Style String.
 */
function createStyleString(style: Style): string {
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

const ls: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("ls", args, {
      boolean: ["a", "1"],
      alias: {
        all: ["a"],
      },
    });

    if (parsedOptions === null) {
      return;
    }

    const paths: string[] =
      parsedOptions._.length > 0
        ? parsedOptions._
        : [
            FileSystemUtil.formatPath(
              FileSystemUtil.getCurrentWorkingDirectory(),
            ),
          ];

    const pathResults = processPaths(paths);
    const output = formatPathResults(pathResults, {
      a: parsedOptions.a,
      "1": parsedOptions["1"],
    });

    if (output !== "") {
      TerminalUtil.appendRawOutput(`\n${output}`);
    }
  },
};

// noinspection JSUnusedGlobalSymbols
export default ls;
