import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import { FileTreeNode } from "virtual:file-tree";
import FormatterUtil from "../../util/formatter_util.ts";
import { clone } from "lodash-es";
import CommandUtil from "../../util/command_util.ts";
import { HelpInformation } from "./help.ts";

// TODO: 'ls -1s' works but 'ls -s1' does not work. This is an issue with the getopts
//  library. Planning on investigating a more maintained alternative so this is
//  a low priority issue for now.
const LS: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("ls", args, {
      boolean: ["a", "1", "s", "h", "l"],
      string: ["block-size"],
      alias: {
        all: ["a"],
        size: ["s"],
        "human-readable": ["h"],
      },
    });

    if (parsedOptions === null) {
      return;
    }

    let blockSize: number | null = null;
    const blockSizeRaw: string = parsedOptions["block-size"];
    if (blockSizeRaw) {
      blockSize = Number.parseInt(blockSizeRaw);

      if (
        blockSizeRaw.includes(".") ||
        Number.isNaN(blockSize) ||
        blockSize < 1
      ) {
        TerminalUtil.appendOutput(
          `ls: invalid --block-size argument '${parsedOptions["block-size"]}'`,
        );
        return;
      }
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
      s: parsedOptions.s,
      h: parsedOptions.h,
      l: parsedOptions.l,
      blockSize: blockSize,
    });

    if (output !== "") {
      TerminalUtil.appendRawOutput(output);
    }
  },

  help(): HelpInformation | null {
    return {
      synopsis: "ls [FILE] [-l|-1] [-ahs] [--block-size block-size]",
      shortDescription: "List directory contents.",
      longDescription:
        "List information about the FILEs (the current directory by default). Sort entries alphabetically. Mandatory arguments to long options are mandatory for short options too.",
      options: [
        {
          short: "a",
          long: "all",
          description: "do not ignore entries starting with .",
        },
        {
          long: "block-size=SIZE",
          description:
            "with -l, scale sizes by SIZE when printing them; e.g., '--block-size=M'; see SIZE format below",
        },
        {
          short: "h",
          long: "human-readable",
          description: "with -l and -s, print sizes like 1K 234M 2G etc.",
        },
        {
          short: "l",
          description: "use a long listing format",
        },
        {
          short: "s",
          long: "size",
          description: "print the allocated size of each file, in blocks",
        },
        {
          short: "1",
          description: "list one file per line",
        },
      ],
      additionalInformation:
        "The SIZE argument is an integer (example: 1024 for 1 kilobyte).",
      arguments: [
        {
          name: "FILE",
          description: "path to either a file or directory",
        },
      ],
    };
  },
};

// noinspection JSUnusedGlobalSymbols
export default LS;

interface Flags {
  a: boolean;
  1: boolean;
  s: boolean;
  h: boolean;
  l: boolean;
  blockSize: number | null;
}

interface EntryNode extends FileTreeNode {
  children: EntryNode[];
  fullPath: string;
  hardLinks: number;
}

interface PathResults {
  unknownPaths: string[];
  fileEntries: EntryNode[];
  directoryEntries: EntryNode[];
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
    hardLinks: FileSystemUtil.calculateHardLinks(fileTreeNode),
    blocks: fileTreeNode.blocks,
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
function formatPathResults(pathResults: PathResults, flags: Flags): string {
  let output = "";

  const unknownPathOutput = formatUnknownPaths(pathResults.unknownPaths);
  if (unknownPathOutput !== "") {
    output += `${unknownPathOutput}\n`;
  }

  const fileEntriesOutput = formatFileEntries(pathResults.fileEntries, flags);
  if (fileEntriesOutput !== "") {
    output += `${fileEntriesOutput}\n\n`;
  }

  const isPreviousOutput = output !== "";
  const directoryEntriesOutput = formatDirectoryEntries(
    pathResults.directoryEntries,
    isPreviousOutput,
    flags,
  );
  if (directoryEntriesOutput !== "") {
    output += directoryEntriesOutput;
  }

  return output.trimEnd();
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
 * @param flags flags for formatting.
 * @returns the formatted file entries.
 */
function formatFileEntries(fileEntries: EntryNode[], flags: Flags): string {
  fileEntries = sortEntryNodes(fileEntries);

  const formattedFileEntries: string[] = [];
  for (const fileEntry of fileEntries) {
    const formattedFileEntry = formatEntry(fileEntry, flags, false);
    formattedFileEntries.push(formattedFileEntry);
  }

  if (flags["1"] || flags.l) {
    return formattedFileEntries.join("\n");
  } else {
    return FormatterUtil.toDynamicGrid(formattedFileEntries);
  }
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
  flags: Flags,
) {
  const outputs: string[] = [];

  directoryEntries = sortEntryNodes(directoryEntries);

  for (const directoryEntry of directoryEntries) {
    const directoryEntryChildren = getSortedDirectoryEntryChildren(
      directoryEntry,
      flags,
    );

    const formattedChildren: string[] = formatDirectoryEntryChildren(
      directoryEntryChildren,
      flags,
    );

    let output: string = "";

    if (directoryEntries.length !== 1 || isPreviousOutput) {
      output += `${directoryEntry.fullPath}:`;

      if (formattedChildren.length !== 0 || flags.s || flags.l) {
        output += "\n";
      }
    }

    if (flags.s || flags.l) {
      const totalSize = getTotalBlockSize(directoryEntryChildren, flags);
      output += `total: ${totalSize}`;

      if (formattedChildren.length !== 0) {
        output += "\n";
      }
    }

    if (flags["1"] || flags.l) {
      output += `${formattedChildren.join("\n")}`;
    } else {
      const grid = FormatterUtil.toDynamicGrid(formattedChildren);
      output += grid;
    }

    outputs.push(output);
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
  flags: Flags,
): EntryNode[] {
  let children = sortEntryNodes(directoryEntry.children);

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
  } else {
    children = children.filter(
      (entry) => !FileSystemUtil.isDotEntry(entry.name),
    );
  }

  return children;
}

/**
 * Sorts EntryNodes alphabetically by their `fullPath`, ignoring any starting
 * '.' characters.
 *
 * @param nodes the nodes to sort inline.
 * @see stripLeadingDots
 */
function sortEntryNodes(nodes: EntryNode[]): EntryNode[] {
  return FileSystemUtil.sortNodes(nodes) as EntryNode[];
}

/**
 * Sorts and Formats Directory Entry Children.
 * <p>
 * Children will be coloured based on {@link FormatterUtil.getFileSystemEntry}.
 *
 * @param children list of directory entry children.
 * @param flags flags for formatting.
 * @returns a list of formatted children.
 */
function formatDirectoryEntryChildren(
  children: EntryNode[],
  flags: Flags,
): string[] {
  const formattedChildren: string[] = [];

  for (const child of children) {
    const formattedChild = formatEntry(child, flags, true);
    formattedChildren.push(formattedChild);
  }

  return formattedChildren;
}

/**
 * Formats a single entry, either a File or Directory. This applies appropriate
 * colouring, naming, and flag related formatting.
 *
 * @param entry the entry to format.
 * @param flags the formatting flags.
 * @param useShortName true to use the entry name, false to use the full path.
 */
function formatEntry(entry: EntryNode, flags: Flags, useShortName: boolean) {
  const fileSystemEntry = FormatterUtil.getFileSystemEntry(
    {
      name: entry.name,
      path: entry.path,
      isDirectory: entry.isDirectory,
      lastModifiedTime: entry.lastModifiedTime,
      size: entry.size,
      permissions: entry.permissions,
      owner: entry.owner,
      group: entry.group,
      blocks: entry.blocks,
    },
    useShortName,
  );

  let formattedChild: string;
  if (flags.l) {
    const permissionsString = FileSystemUtil.getHumanReadablePermissions(
      entry.permissions,
      entry.isDirectory,
    );
    const dateTime = formatDateTime(entry.lastModifiedTime);
    const size = getSize(entry, flags);

    formattedChild = `${permissionsString} ${entry.hardLinks} ${entry.owner} ${entry.group}\t${size} ${dateTime} ${fileSystemEntry}`;
  }

  if (flags.s) {
    const size: string = getBlockSize(entry, flags);
    formattedChild = `${size} ${fileSystemEntry}`;
  }

  formattedChild ??= fileSystemEntry;

  return formattedChild;
}

/**
 * Formats the provided `dateTime` into a string.
 * @param datetime the datetime to convert.
 * @returns a datetime string, e.g. `17 Aug 00:33`.
 */
function formatDateTime(datetime: Date): string {
  return datetime
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

/**
 * Gets the size of the `entry` with a value dependent on `flags.h`.
 * - If `flags.h` is true, then a human-readable `size` value is returned.
 * - If `flags.h` is false, then a 'blockSize' sized value is returned.
 *
 * @param entry the entry to get the size of.
 * @param flags the formatting flags.
 */
function getSize(entry: EntryNode, flags: Flags): string {
  if (flags.h && !flags.blockSize) {
    /*
    Functionally this is wrong. FileSystemUtil.getHumanReadableSize does NOT return the same values we'd expect in a
    'ls -lh' call - this provides values such as '272' and '4.0K'. I care a lot about 'parity' with actual commands
    but this just seems redundant to fix, especially with the looming complexity of ls as it is.
     */
    return flags.h && !flags.blockSize
      ? FileSystemUtil.getHumanReadableSize(entry.size)
      : `${entry.size}`;
  }

  const to = flags.blockSize ? flags.blockSize : 1;
  return `${FileSystemUtil.calculateBlocks(entry.size, 1, to)}`;
}

/**
 * Gets the block size of the `entry` with a value dependent on `flags.h`.
 * - If `flags.h` is true, then a human-readable `blocks * 512` value is returned.
 * - If `flags.h` is false, then a 'blockSize' sized block value is returned.
 *
 * @param entry the entry to get the size of.
 * @param flags the formatting flags.
 */
function getBlockSize(entry: EntryNode, flags: Flags): string {
  if (flags.h && !flags.blockSize) {
    return FileSystemUtil.getHumanReadableSize(entry.blocks * 512);
  }

  const to = flags.blockSize ? flags.blockSize : 1024;
  return `${FileSystemUtil.calculateBlocks(entry.blocks, 512, to)}`;
}

/**
 * Gets the total block size of all the `entries` with a value dependent on `flags.h`.
 * - If `flags.h` is true, then a human-readable `blocks * 512` value is returned.
 * - If `flags.h` is false, then the sum of 'blockSize' sized block values is returned.
 *
 * @param entries the entries to get the total size of.
 * @param flags the formatting flags.
 */
function getTotalBlockSize(entries: EntryNode[], flags: Flags): string {
  let output: string;

  if (flags.h && !flags.blockSize) {
    const totalSize = entries.reduce(
      (sum, child) => sum + child.blocks * 512,
      0,
    );

    output = FileSystemUtil.getHumanReadableSize(totalSize);
  } else {
    let totalSize = entries.reduce((sum, child) => sum + child.blocks, 0);

    const to = flags.blockSize ? flags.blockSize : 1024;
    totalSize = FileSystemUtil.calculateBlocks(totalSize, 512, to);

    output = `${totalSize}`;
  }

  return output;
}
