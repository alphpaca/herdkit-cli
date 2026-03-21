import type { Command } from "commander";
import { Text, Box } from "ink";
import React from "react";
import type { CommandContext } from "~/kernel/context";
import { readConfig } from "~/kernel/config";
import { detectPackages } from "~/modules/packages/services/detect_packages";
import { detectConflicts } from "~/modules/packages/services/detect_conflicts";
import type { DependencyConflict } from "~/modules/packages/models/dependency_conflict";

function ConflictList({ conflicts }: { conflicts: DependencyConflict[] }) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="red" bold>
        {conflicts.length} dependency conflict{conflicts.length !== 1 ? "s" : ""} found:
      </Text>
      <Box marginTop={1} />
      {conflicts.map((conflict) => (
        <Box key={conflict.dependency} flexDirection="column" marginBottom={1}>
          <Text bold>{conflict.dependency}</Text>
          {conflict.versions.map((v) => (
            <Text key={v.constraint}>
              {"  "}
              <Text color="yellow">{v.constraint}</Text>
              <Text dimColor>{" — "}</Text>
              <Text>{v.packages.join(", ")}</Text>
            </Text>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function SuccessMessage() {
  return (
    <Box padding={1}>
      <Text color="green">All package dependencies are consistent.</Text>
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

export function registerVerifyCommand(parent: Command, ctx: CommandContext): void {
  parent
    .command("verify")
    .description("Verify dependency version consistency across packages")
    .action(async () => {
      try {
        const config = await readConfig(ctx.cwd, ctx.filesystem);
        const packages = await detectPackages(ctx.cwd, config, ctx.filesystem);
        const conflicts = detectConflicts(packages);

        if (conflicts.length === 0) {
          ctx.render(<SuccessMessage />);
          return;
        }

        ctx.render(<ConflictList conflicts={conflicts} />);
        process.exitCode = 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        ctx.render(<ErrorMessage message={message} />);
        process.exitCode = 1;
      }
    });
}
