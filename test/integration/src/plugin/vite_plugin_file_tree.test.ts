import { describe, expect, test } from "vitest"; // or jest
import fs from "fs";
import path from "path";
import os from "os";
import { walk } from "../../../../src/plugins/vite_plugin_file_tree";
import { sortBy } from "lodash";
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FileTreeNode } from "virtual:file-tree";

let testRootDir: string;

function deepSortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return sortBy(nodes, "name").map((node) => ({
    ...node,
    children: node.children ? deepSortTree(node.children) : undefined,
  }));
}

describe("walk", () => {
  test("should return the correct file tree", () => {
    // Arrange
    testRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "walk-test-"));
    fs.mkdirSync(path.join(testRootDir, "foo"));
    fs.mkdirSync(path.join(testRootDir, "foo", "bar"));
    fs.writeFileSync(path.join(testRootDir, "bazzing.gaz"), "");
    fs.writeFileSync(path.join(testRootDir, "foo", ".testing"), "");
    fs.writeFileSync(path.join(testRootDir, "foo", "daz"), "");

    // Act
    const tree = walk(testRootDir);
    fs.rmSync(testRootDir, { recursive: true, force: true });

    // Assert
    expect(deepSortTree(tree)).toMatchSnapshot();
  });

  test(".gitkeep files are not included in the file tree", () => {
    // Arrange
    const gitKeep = ".gitkeep";

    testRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "walk-test-"));
    fs.mkdirSync(path.join(testRootDir, "foo"));
    fs.writeFileSync(path.join(testRootDir, gitKeep), "");
    fs.writeFileSync(path.join(testRootDir, "foo", gitKeep), "");

    // Act
    const tree = walk(testRootDir);
    fs.rmSync(testRootDir, { recursive: true, force: true });

    // Assert
    expect(deepSortTree(tree)).toMatchSnapshot();
  });
});
