import { CommandScript } from "../command/command_script.ts";

const commandFiles: Record<string, () => Promise<{ default: CommandScript }>> =
  import.meta.glob<{ default: CommandScript }>("/src/command/scripts/*.ts");

export default function getCommandScripts(): Record<
  string,
  () => Promise<{ default: CommandScript }>
> {
  return commandFiles;
}
