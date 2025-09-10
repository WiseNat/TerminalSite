// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FileTreeNode } from "virtual:file-tree";

export const fileTree: FileTreeNode = [
  {
    name: "src",
    path: "",
    isDirectory: true,
    blocks: 8,
    children: [
      {
        name: "main",
        path: "src",
        isDirectory: true,
        blocks: 8,
        children: [
          {
            name: "foo",
            path: "src/main",
            isDirectory: true,
            blocks: 8,
            children: [
              {
                name: "bar",
                path: "src/main/foo",
                isDirectory: true,
                blocks: 8,
                children: [],
              },
              {
                name: "daz",
                path: "src/main/foo",
                isDirectory: false,
                blocks: 12,
              },
              {
                name: "bazzing.gaz",
                path: "src/main/foo",
                isDirectory: false,
                blocks: 23,
              },
            ],
          },
          {
            name: ".testing",
            path: "src/main",
            isDirectory: false,
            blocks: 19,
          },
          {
            name: ".empty",
            path: "src/main",
            isDirectory: true,
            blocks: 8,
            children: [],
          },
          {
            name: ".full",
            path: "src/main",
            isDirectory: true,
            blocks: 8,
            children: [
              {
                name: "someEmptyDir",
                path: "src/main/.full",
                isDirectory: true,
                children: [],
              },
              {
                name: "aFile",
                path: "src/main/.full",
                isDirectory: false,
                blocks: 12,
              },
            ],
          },
        ],
      },
      {
        name: "index.ts",
        path: "src",
        isDirectory: false,
        blocks: 52,
      },
    ],
  },
  {
    name: "test",
    path: "",
    isDirectory: true,
    blocks: 8,
    children: [],
  },
];
