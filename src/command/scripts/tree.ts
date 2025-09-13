import { CommandScript } from "../command_script.ts";
import CommandUtil from "../../util/command_util.ts";
import FileSystemUtil from "../../util/file_system_util.ts";
import TerminalUtil from "../../util/terminal_util.ts";
import ColourUtil from "../../util/colour_util.ts";
import { FileTreeNode } from "virtual:file-tree";

// TODO: JSDocs..

interface TreeView {
  content: string;
  directoryCount: number;
  fileCount: number;
}

function generateOutput(paths: string[]): string {
  const trees: string[] = [];
  let totalDirectoryCount: number = 0;
  let totalFileCount: number = 0;

  for (const path of paths) {
    const tree = getTreeViewForPath(path);

    trees.push(tree.content);
    totalDirectoryCount += tree.directoryCount;
    totalFileCount += tree.fileCount;
  }

  const directorySuffix: string =
    totalDirectoryCount === 1 ? "directory" : "directories";
  const fileSuffix: string = totalFileCount === 1 ? "file" : "files";

  return (
    trees.join("\n") +
    "\n\n" +
    `${totalDirectoryCount} ${directorySuffix}, ${totalFileCount} ${fileSuffix}`
  );
}

function getTreeViewForPath(path: string): TreeView {
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

  return generateTreeFromNode(node);
}

function generateTreeFromNode(node: FileTreeNode): TreeView {
  const tree: TreeView = {
    content: "",
    fileCount: 0,
    directoryCount: 0,
  };

  tree.content = ColourUtil.getFileSystemEntry(node, false);

  if (node.children === undefined || node.children.length === 0) {
    return tree;
  }

  tree.content += "\n";

  // Tree has a strange behaviour where if the given path is not an empty dir
  // the directory itself count towards the total directories.
  tree.directoryCount++;

  type StackEntry = {
    node: FileTreeNode;
    prefix: string;
    isLast: boolean;
  };

  const stack: StackEntry[] = [];

  // Add immediate children to stack
  const immediateChildren = sortNodes(node.children);
  for (let index = immediateChildren.length - 1; index >= 0; index--) {
    stack.push({
      node: immediateChildren[index],
      prefix: "",
      isLast: index === immediateChildren.length - 1,
    });
  }

  while (stack.length > 0) {
    const { node, prefix, isLast } = stack.pop()!;

    tree.content += `${prefix}${isLast ? "└── " : "├── "}${node.name}\n`;

    if (node.isDirectory) {
      tree.directoryCount++;
    } else {
      tree.fileCount++;
    }

    if (node.children === undefined) {
      continue;
    }

    const childPrefix = prefix + (isLast ? "    " : "│   ");
    const children = sortNodes(node.children);

    for (let index = children.length - 1; index >= 0; index--) {
      stack.push({
        node: children[index],
        prefix: childPrefix,
        isLast: index === children.length - 1,
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
  return FileSystemUtil.sortNodes(nodes).filter(
    (node) => !FileSystemUtil.isDotEntry(node.name),
  );
}

const tree: CommandScript = {
  async run(args: string[]): Promise<void> {
    const parsedOptions = CommandUtil.parseArgs("tree", args, {});

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

    const output: string = generateOutput(paths);

    TerminalUtil.appendRawOutput(output);
  },
};

// noinspection JSUnusedGlobalSymbols
export default tree;
