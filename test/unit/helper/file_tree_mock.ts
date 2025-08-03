// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FileTreeNode } from "virtual:file-tree";

export const fileTree: FileTreeNode = [
  {
    name: "src",
    path: "",
    isDirectory: true,
    children: [
      {
        name: "main",
        path: "src",
        isDirectory: true,
        children: [
          {
            name: "foo",
            path: "src/main",
            isDirectory: true,
            children: [
              {
                name: "bar",
                path: "src/main/foo",
                isDirectory: true,
                children: [],
              },
              {
                name: "bazzing.gaz",
                path: "src/main/foo",
                isDirectory: false,
              },
              {
                name: "daz",
                path: "src/main/foo",
                isDirectory: false,
              },
            ],
          },
          {
            name: ".testing",
            path: "src/main",
            isDirectory: false,
          },
        ],
      },
      {
        name: "index.ts",
        path: "src",
        isDirectory: false,
      },
    ],
  },
  {
    name: "test",
    path: "",
    isDirectory: true,
    children: [],
  },
];
