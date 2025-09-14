import { CommandScript } from "../command_script.ts";
import CommandUtil from "../../util/command_util.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import ColourUtil from "../../util/colour_util.ts";
import { FileTreeNode } from "virtual:file-tree";

// TODO: JSDocs..

interface Flags {
  a: boolean;
  d: boolean;
  prune: boolean;
  f: boolean;
  L: number;
}

interface TreeView {
  content: string;
  directoryCount: number;
  fileCount: number;
}

function generateOutput(paths: string[], flags: Flags): string {
  const trees: string[] = [];
  let totalDirectoryCount: number = 0;
  let totalFileCount: number = 0;

  for (const path of paths) {
    const tree = getTreeViewForPath(path, flags);

    trees.push(tree.content);
    totalDirectoryCount += tree.directoryCount;
    totalFileCount += tree.fileCount;
  }

  const directorySegment = `${totalDirectoryCount} ${totalDirectoryCount === 1 ? "directory" : "directories"}`;
  const output = `${trees.join("\n")}\n\n${directorySegment}`;

  if (flags.d) {
    return output;
  }

  const fileSegment = `${totalFileCount} ${totalFileCount === 1 ? "file" : "files"}`;
  return `${output}, ${fileSegment}`;
}

function getTreeViewForPath(path: string, flags: Flags): TreeView {
  const tree: TreeView = {
    content: "",
    directoryCount: 0,
    fileCount: 0,
  };

  const resolvedPathParts = FileSystemUtil.resolvePathParts(path);

  if (resolvedPathParts === null) {
    tree.content = getUnknownPathError(path);
    return tree;
  }

  const node = FileSystemUtil.walkFileTree(resolvedPathParts);

  if (node === null) {
    const formattedPath = FileSystemUtil.formatPath(resolvedPathParts);
    tree.content = getUnknownPathError(formattedPath);

    return tree;
  }

  if (!node.isDirectory || node.children === undefined) {
    tree.content = getFilePathError(node);
    tree.fileCount = 1;

    return tree;
  }

  return generateTreeFromNode(node, flags);
}

function generateTreeFromNode(node: FileTreeNode, flags: Flags): TreeView {
  const tree: TreeView = {
    content: "",
    fileCount: 0,
    directoryCount: 0,
  };

  tree.content += ColourUtil.getFileSystemEntry(node, false);

  if (node.children === undefined || node.children.length === 0) {
    return tree;
  }

  tree.content += "\n";

  // The Linux tree command has strange behaviour where, if the given path is
  // not an empty dir, the directory itself count towards the total directories.
  tree.directoryCount++;

  type StackEntry = {
    node: FileTreeNode;
    prefix: string;
    isLast: boolean;
    depth: number;
  };

  const stack: StackEntry[] = [];

  // Add immediate children to stack
  const immediateChildren = filterNodes(sortNodes(node.children), flags);
  for (let index = immediateChildren.length - 1; index >= 0; index--) {
    stack.push({
      node: immediateChildren[index],
      prefix: "",
      isLast: index === immediateChildren.length - 1,
      depth: 1,
    });
  }

  while (stack.length > 0) {
    const { node, prefix, isLast, depth } = stack.pop()!;

    const filename = ColourUtil.getFileSystemEntry(node, !flags.f);
    tree.content += `${prefix}${isLast ? "└── " : "├── "}${filename}\n`;

    if (node.isDirectory) {
      tree.directoryCount++;
    } else {
      tree.fileCount++;
    }

    if (node.children === undefined || (flags.L > 0 && depth + 1 > flags.L)) {
      continue;
    }

    const childPrefix = prefix + (isLast ? "    " : "│   ");
    const children = filterNodes(sortNodes(node.children), flags);

    for (let index = children.length - 1; index >= 0; index--) {
      stack.push({
        node: children[index],
        prefix: childPrefix,
        isLast: index === children.length - 1,
        depth: depth + 1,
      });
    }
  }

  tree.content = tree.content.trimEnd();

  return tree;
}

function getUnknownPathError(path: string): string {
  return getPathError(path);
}

function getFilePathError(node: FileTreeNode): string {
  const fileSystemEntry: string = ColourUtil.getFileSystemEntry(node, false);
  return getPathError(fileSystemEntry);
}

function getPathError(path: string): string {
  return `${path}  [error opening dir]`;
}

function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return FileSystemUtil.sortNodes(nodes);
}

function filterNodes(nodes: FileTreeNode[], flags: Flags): FileTreeNode[] {
  if (flags.d) {
    nodes = nodes.filter((node) => node.isDirectory);
  }

  if (!flags.a) {
    nodes = nodes.filter((node) => !FileSystemUtil.isDotEntry(node.name));
  }

  if (flags.prune) {
    nodes = nodes.filter(
      (node) =>
        !node.isDirectory ||
        node.children === undefined ||
        node.children.length > 0,
    );
  }

  return nodes;
}

const tree: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("tree", args, {
      boolean: ["a", "d", "prune", "f"],
      string: ["L"],
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

    let lFlagValue: number = -1;
    const lFlagValueRaw: string = parsedOptions.L;
    if (lFlagValueRaw) {
      lFlagValue = parseInt(lFlagValueRaw);

      if (isNaN(lFlagValue) || lFlagValue < 1) {
        TerminalUtil.appendOutput(
          "\ntree: Invalid level, must be greater than 0.",
        );
        return;
      }
    }

    const output: string = generateOutput(paths, {
      a: parsedOptions.a,
      d: parsedOptions.d,
      prune: parsedOptions.prune,
      f: parsedOptions.f,
      L: lFlagValue,
    });

    TerminalUtil.appendRawOutput(`\n${output}`);
  },
};

// noinspection JSUnusedGlobalSymbols
export default tree;
