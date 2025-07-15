import { afterAll, beforeAll, describe, expect, test } from "vitest"; // or jest
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

beforeAll(() => {
  testRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "walk-test-"));

  fs.mkdirSync(path.join(testRootDir, "foo"));
  fs.mkdirSync(path.join(testRootDir, "foo", "bar"));
  fs.writeFileSync(path.join(testRootDir, "bazzing.gaz"), "");
  fs.writeFileSync(path.join(testRootDir, "foo", ".testing"), "");
  fs.writeFileSync(path.join(testRootDir, "foo", "daz"), "");
});

afterAll(() => {
  fs.rmSync(testRootDir, { recursive: true, force: true });
});

describe("walk", () => {
  test("should return the correct file tree", () => {
    const tree = walk(testRootDir);

    expect(deepSortTree(tree)).toMatchSnapshot();
  });
});
