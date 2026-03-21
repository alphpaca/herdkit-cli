import type { Command } from "commander";
import type { CommandContext } from "~/kernel/context";
import { registerListCommand } from "./list/command";
import { registerVerifyCommand } from "./verify/command";

export function registerPackagesCommand(program: Command, ctx: CommandContext): void {
  const packages = program.command("packages").description("Manage monorepo packages");

  registerListCommand(packages, ctx);
  registerVerifyCommand(packages, ctx);
}
