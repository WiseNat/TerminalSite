/* -- Generic -- */

export type AstNode = {
  readonly type: string;
};

/* -- Lexer Types -- */

export type TokenPart = {
  type: TokenPartType;
  value: string | undefined;
};

export type Token = {
  type: TokenType | undefined;
  parts: TokenPart[] | null | undefined;
};

export enum TokenType {
  WORD,
  TRAILING_WHITESPACE,
  EOF,
}

export enum TokenPartType {
  LITERAL,
  SINGLE_QUOTED,
  DOUBLE_QUOTED,
}

/* -- Parser Types -- */

export type CommandNode = SimpleCommand;

export interface SimpleCommand extends AstNode {
  readonly type: "SimpleCommand";
  readonly words: Token[];
}

/* -- Expander Types -- */

export type ExecutionCommandNode = ExecutionCommand;

export interface ExecutionCommand extends AstNode {
  readonly type: "ExecutionCommand";
  readonly name: string;
  readonly args: string[];
}
