declare module "virtual:file-tree" {
  export type FileTreeNode = {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
    lastModifiedTime: Date;
    size: number;
    permissions: number[];
    owner: string;
    group: string;
  };

  export const fileTree: FileTreeNode[];
}
