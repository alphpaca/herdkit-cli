import type { Command } from "commander";
import { Text, Box } from "ink";
import React from "react";
import type { CommandContext } from "~/kernel/context";
import { readConfig } from "~/kernel/config";
import { detectPackages } from "~/modules/packages/services/detect_packages";
import type { Package } from "~/modules/packages/models/package";

function PackageList({ packages }: { packages: Package[] }) {
  return (
    <Box flexDirection="column" padding={1}>
      {packages.map((pkg) => (
        <Box key={pkg.path} gap={2}>
          <Text bold>{pkg.name}</Text>
          <Text dimColor>{pkg.path}</Text>
        </Box>
      ))}
    </Box>
  );
}

function NoPackagesMessage() {
  return (
    <Box padding={1}>
      <Text color="yellow">No packages found in configured paths.</Text>
    </Box>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <Box padding={1}>
      <Text color="red">Error: {message}</Text>
    </Box>
  );
}

export function registerPackagesCommand(program: Command, ctx: CommandContext): void {
  const packages = program.command("packages").description("Manage monorepo packages");

  packages
    .command("list")
    .description("List all detected packages")
    .action(async () => {
      try {
        const config = await readConfig(ctx.cwd, ctx.filesystem);
        const detected = await detectPackages(ctx.cwd, config, ctx.filesystem);

        if (detected.length === 0) {
          ctx.render(<NoPackagesMessage />);
          return;
        }

        ctx.render(<PackageList packages={detected} />);
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        ctx.render(<ErrorMessage message={message} />);
        process.exitCode = 1;
      }
    });
}
