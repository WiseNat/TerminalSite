import { CommandScript } from "../command/command_script.ts";

const commandFiles = import.meta.glob<{ default: CommandScript }>(
  "/src/command/scripts/*.ts",
);

export default function getCommandScripts(): Record<
  string,
  () => Promise<{ default: CommandScript }>
> {
  return commandFiles;
}
