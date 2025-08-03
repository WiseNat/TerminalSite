// @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { FileTreeNode } from "virtual:file-tree";

export const fileTree: FileTreeNode = [
  {
    children: [{ name: "index.ts", path: "src", isDirectory: false }],
    isDirectory: true,
    name: "src",
    path: "",
  },
];
