declare module "virtual:file-tree" {
  export type FileTreeNode = {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
  };

  export const fileTree: FileTreeNode[];
}
