export interface CommandScript {
  run(args: string[]): void;
  autocomplete?(args: string[]): string[] | null;
}
