// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import getopts, { ParsedOptions } from "getopts";
import { CommandScript } from "../command_script.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import { FileTreeNode } from "virtual:file-tree";
import ColourUtil from "../../util/colour_util.ts";

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
// TODO: pass processing flags (e.g. -a) into this method!
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
 * @returns structured human-readable text.
 */
// TODO: pass formatting flags (e.g. -l, -s, -h, -1) into this method!
function formatPathResults(pathResults: PathResults): string {
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

  outputs.sort((a, b) => a.localeCompare(b));

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
 * @returns the formatted directory entries.
 */
function formatDirectoryEntries(
  directoryEntries: EntryNode[],
  isPreviousOutput: boolean,
) {
  const outputs: string[] = [];

  directoryEntries.sort((a, b) => a.fullPath.localeCompare(b.fullPath));

  for (const directoryEntry of directoryEntries) {
    const children: string[] = formatDirectoryEntryChildren(
      directoryEntry.children,
    );

    if (directoryEntries.length === 1 && !isPreviousOutput) {
      outputs.push(`${children.join("\t")}`);
    } else {
      let output = `${directoryEntry.fullPath}:`;
      if (children.length !== 0) {
        output += `\n${children.join("\t")}`;
      }

      outputs.push(output);
    }
  }

  return outputs.join("\n\n");
}

/**
 * Sorts and Formats Directory Entry Children.
 * <p>
 * Children will be coloured based on {@link ColourUtil.getFileSystemEntryStyle}.
 *
 * @param children
 * @returns a list of formatted children.
 */
function formatDirectoryEntryChildren(children: EntryNode[]): string[] {
  children.sort((a, b) => a.name.localeCompare(b.name));

  const formattedChildren: string[] = [];

  for (const child of children) {
    if (isDotEntry(child.name)) {
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

    const styleString = [
      style.foreground === null ? null : `color: ${style.foreground}`,
      style.background === null ? null : `background: ${style.background}`,
      style.fontWeight === null ? null : `font-weight: ${style.fontWeight}`,
    ]
      .filter(function (val) {
        return val !== null;
      })
      .join("; ");

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
 * @param name the file name to check
 * @returns true if the file is a dot-file or dot-directory, false otherwise.
 */
function isDotEntry(name: string): boolean {
  return name.startsWith(".");
}

const ls: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions: ParsedOptions = getopts(args);

    // const path: string[] = parsedOptions._.length > 0 : parsedOptions._ : [FileSystemUtil.getCurrentWorkingDirectory()];
    const paths: string[] =
      parsedOptions._.length > 0
        ? parsedOptions._
        : [
            FileSystemUtil.formatPath(
              FileSystemUtil.getCurrentWorkingDirectory(),
            ),
          ];

    const pathResults = processPaths(paths);
    const output = formatPathResults(pathResults);

    if (output !== "") {
      TerminalUtil.appendRawOutput(`\n${output}`);
    }
  },
};

// noinspection JSUnusedGlobalSymbols
export default ls;
