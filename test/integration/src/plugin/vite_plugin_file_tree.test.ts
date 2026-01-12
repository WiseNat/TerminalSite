import { beforeEach, describe, expect, test } from "vitest";
import fs from "fs";
import { walk } from "../../../../src/plugins/vite_plugin_file_tree";
import { sortBy } from "lodash-es";
import { FileTreeNode } from "virtual:file-tree";
import { vol } from "memfs";

function deepSortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return sortBy(nodes, "name").map((node) => ({
    ...node,
    lastModifiedTime: new Date(2020, 0), // this value is unpredictable, even for snapshots
    children: node.children ? deepSortTree(node.children) : undefined,
  }));
}

describe("VitePluginTree", () => {
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
      expect(deepSortTree(tree)).toMatchInlineSnapshot(`
        [
          {
            "blocks": 1,
            "children": undefined,
            "group": "root",
            "isDirectory": false,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "bazzing.gaz",
            "owner": "root",
            "path": "",
            "permissions": [
              6,
              6,
              4,
            ],
            "size": 0,
          },
          {
            "blocks": 1,
            "children": [
              {
                "blocks": 1,
                "children": undefined,
                "group": "root",
                "isDirectory": false,
                "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                "name": ".testing",
                "owner": "root",
                "path": "foo",
                "permissions": [
                  6,
                  6,
                  4,
                ],
                "size": 0,
              },
              {
                "blocks": 1,
                "children": [],
                "group": "root",
                "isDirectory": true,
                "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                "name": "bar",
                "owner": "root",
                "path": "foo",
                "permissions": [
                  7,
                  5,
                  5,
                ],
                "size": 0,
              },
              {
                "blocks": 1,
                "children": undefined,
                "group": "root",
                "isDirectory": false,
                "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                "name": "daz",
                "owner": "root",
                "path": "foo",
                "permissions": [
                  6,
                  6,
                  4,
                ],
                "size": 0,
              },
            ],
            "group": "root",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "foo",
            "owner": "root",
            "path": "",
            "permissions": [
              7,
              5,
              5,
            ],
            "size": 0,
          },
        ]
      `);
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
      expect(deepSortTree(tree)).toMatchInlineSnapshot(`
        [
          {
            "blocks": 1,
            "children": [],
            "group": "root",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "foo",
            "owner": "root",
            "path": "",
            "permissions": [
              7,
              5,
              5,
            ],
            "size": 0,
          },
        ]
      `);
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
      expect(deepSortTree(tree)).toMatchInlineSnapshot(`
        [
          {
            "blocks": 1,
            "children": [],
            "group": "root",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "foo",
            "owner": "root",
            "path": "",
            "permissions": [
              7,
              5,
              5,
            ],
            "size": 0,
          },
        ]
      `);
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
      expect(deepSortTree(tree)).toMatchInlineSnapshot(`
        [
          {
            "blocks": 1,
            "children": [
              {
                "blocks": 1,
                "children": [],
                "group": "root",
                "isDirectory": true,
                "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                "name": "bar",
                "owner": "root",
                "path": "foo",
                "permissions": [
                  7,
                  5,
                  5,
                ],
                "size": 0,
              },
            ],
            "group": "root",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "foo",
            "owner": "root",
            "path": "",
            "permissions": [
              7,
              5,
              5,
            ],
            "size": 0,
          },
          {
            "blocks": 1,
            "children": [
              {
                "blocks": 1,
                "children": [
                  {
                    "blocks": 1,
                    "children": undefined,
                    "group": "bazzing.gaz",
                    "isDirectory": false,
                    "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                    "name": "bazzing.gaz",
                    "owner": "bazzing.gaz",
                    "path": "some/home",
                    "permissions": [
                      6,
                      6,
                      4,
                    ],
                    "size": 0,
                  },
                  {
                    "blocks": 1,
                    "children": [
                      {
                        "blocks": 1,
                        "children": undefined,
                        "group": "daz",
                        "isDirectory": false,
                        "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                        "name": "test",
                        "owner": "daz",
                        "path": "some/home/daz",
                        "permissions": [
                          6,
                          6,
                          4,
                        ],
                        "size": 0,
                      },
                    ],
                    "group": "daz",
                    "isDirectory": true,
                    "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                    "name": "daz",
                    "owner": "daz",
                    "path": "some/home",
                    "permissions": [
                      7,
                      7,
                      5,
                    ],
                    "size": 0,
                  },
                  {
                    "blocks": 1,
                    "children": [
                      {
                        "blocks": 1,
                        "children": undefined,
                        "group": "gaz",
                        "isDirectory": false,
                        "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                        "name": "test",
                        "owner": "gaz",
                        "path": "some/home/gaz",
                        "permissions": [
                          6,
                          6,
                          4,
                        ],
                        "size": 0,
                      },
                    ],
                    "group": "gaz",
                    "isDirectory": true,
                    "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                    "name": "gaz",
                    "owner": "gaz",
                    "path": "some/home",
                    "permissions": [
                      7,
                      7,
                      5,
                    ],
                    "size": 0,
                  },
                ],
                "group": "root",
                "isDirectory": true,
                "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                "name": "home",
                "owner": "root",
                "path": "some",
                "permissions": [
                  7,
                  5,
                  5,
                ],
                "size": 0,
              },
            ],
            "group": "root",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "some",
            "owner": "root",
            "path": "",
            "permissions": [
              7,
              5,
              5,
            ],
            "size": 0,
          },
        ]
      `);
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
      expect(deepSortTree(tree)).toMatchInlineSnapshot(`
        [
          {
            "blocks": 1,
            "children": [
              {
                "blocks": 1,
                "children": undefined,
                "group": "root",
                "isDirectory": false,
                "lastModifiedTime": 2020-01-01T00:00:00.000Z,
                "name": "baz.txt",
                "owner": "some value",
                "path": "bar",
                "permissions": [
                  4,
                  5,
                  6,
                ],
                "size": 0,
              },
            ],
            "group": "root",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "bar",
            "owner": "root",
            "path": "",
            "permissions": [
              7,
              5,
              5,
            ],
            "size": 0,
          },
          {
            "blocks": 1,
            "children": [],
            "group": "ing",
            "isDirectory": true,
            "lastModifiedTime": 2020-01-01T00:00:00.000Z,
            "name": "foo",
            "owner": "test",
            "path": "",
            "permissions": [
              1,
              2,
              3,
            ],
            "size": 0,
          },
        ]
      `);
    });
  });
});
