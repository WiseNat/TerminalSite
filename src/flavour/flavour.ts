export interface Flavour {
  getInitialPrompt(): TextContent;
  getPrompt(path: string[]): TextContent;
}

export interface TextContent {
  value: string;
  isHTML: boolean;
}
