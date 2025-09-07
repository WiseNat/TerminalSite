import { beforeEach, describe, expect, test } from "vitest";
import fs from "fs";
import { walk } from "../../../../src/plugins/vite_plugin_file_tree";
import { sortBy } from "lodash-es";
// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FileTreeNode } from "virtual:file-tree";
import { vol } from "memfs";

function deepSortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return sortBy(nodes, "name").map((node) => ({
    ...node,
    lastModifiedTime: "", // this value is unpredictable, even for snapshots
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

  test(".meta files are not included in the file tree", () => {
    // Arrange
    const testRootDir = "/walk-test-";

    vol.fromJSON(
      {
        foo: null,
        "foo.meta": "{}",
      },
      testRootDir,
    );

    // Act
    const tree = walk(testRootDir);
    fs.rmSync(testRootDir, { recursive: true, force: true });

    // Assert
    expect(deepSortTree(tree)).toMatchSnapshot();
  });

  // TODO: home dir test
  test("should return a valid file tree with a default owner/root based on the home directory", () => {
    // Arrange
    const testRootDir = "/walk-test-";

    vol.fromJSON(
      {
        "foo/bar": null,
        "some/home/bazzing.gaz": "",
        "some/home/gaz/test": "",
        "some/home/daz/test": "",
      },
      testRootDir,
    );

    // Act
    const tree = walk(testRootDir, "some/home");
    fs.rmSync(testRootDir, { recursive: true, force: true });

    // Assert
    expect(deepSortTree(tree)).toMatchSnapshot();
  });

  test("should return a valid file tree with data from a .meta file", () => {
    // Arrange
    const testRootDir = "/walk-test-";

    vol.fromJSON(
      {
        foo: null,
        "foo.meta":
          "{" +
          "\"permissions\": [1, 2, 3], " +
          "\"owner\": \"test\"," +
          "\"group\": \"ing\"" +
          "}",
        "bar/baz.txt": "",
        "bar/baz.txt.meta":
          "{" + "\"permissions\": [4, 5, 6], " + "\"owner\": \"some value\"" + "}",
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
