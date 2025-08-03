import { beforeEach, describe, expect, test } from "vitest";
import fs from "fs";
import { walk } from "../../../../src/plugins/vite_plugin_file_tree";
import { sortBy } from "lodash";
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FileTreeNode } from "virtual:file-tree";
import { vol } from "memfs";

function deepSortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return sortBy(nodes, "name").map((node) => ({
    ...node,
    children: node.children ? deepSortTree(node.children) : undefined,
  }));
}

beforeEach(() => {
  vol.reset();
});

describe("walk", () => {
  test("should return the correct file tree", () => {
    // Arrange
    const testRootDir = "/walk-test-";

    vol.fromJSON(
      {
        "foo/bar": null,
        "bazzing.gaz": "",
        "foo/.testing": "",
        "foo/daz": "",
      },
      testRootDir,
    );

    // Act
    const tree = walk(testRootDir);
    fs.rmSync(testRootDir, { recursive: true, force: true });

    // Assert
    expect(deepSortTree(tree)).toMatchSnapshot();
  });

  test(".gitkeep files are not included in the file tree", () => {
    // Arrange
    const testRootDir = "/walk-test-";

    vol.fromJSON(
      {
        foo: null,
        ".gitkeep": "",
        "foo/.gitkeep": "",
      },
      testRootDir,
    );

    // Act
    const tree = walk(testRootDir);
    fs.rmSync(testRootDir, { recursive: true, force: true });

    // Assert
    expect(deepSortTree(tree)).toMatchSnapshot();
  });
});
