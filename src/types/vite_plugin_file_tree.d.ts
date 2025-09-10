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
    blocks: number;
  };

  export const fileTree: FileTreeNode[];
}
