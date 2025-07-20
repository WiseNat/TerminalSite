export interface CommandScript {
  run(args: string[]): Promise<void>;
  autocomplete?(args: string[]): Promise<string[] | null>;
}
