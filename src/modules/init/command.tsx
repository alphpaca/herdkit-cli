import type { Command } from "commander";
import { Text, Box } from "ink";
import React from "react";
import type { CommandContext } from "~/kernel/context";
import { checkConfigExists, buildConfig, writeConfig } from "~/kernel/config";

function ConfigCreatedMessage() {
  return (
    <Box padding={1}>
      <Text color="green">Created herdkit.yaml</Text>
    </Box>
  );
}

function ConfigExistsMessage() {
  return (
    <Box padding={1}>
      <Text color="yellow">
        herdkit.yaml already exists in this directory. Initialization skipped.
      </Text>
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

export function registerInitCommand(program: Command, ctx: CommandContext): void {
  program
    .command("init")
    .description("Initialize a new herdkit project")
    .action(async () => {
      try {
        const exists = await checkConfigExists(ctx.cwd, ctx.filesystem);
        if (exists) {
          ctx.render(<ConfigExistsMessage />);
          return;
        }

        const config = buildConfig([]);
        await writeConfig(ctx.cwd, config, ctx.filesystem);
        ctx.render(<ConfigCreatedMessage />);
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        ctx.render(<ErrorMessage message={message} />);
        process.exitCode = 1;
      }
    });
}
