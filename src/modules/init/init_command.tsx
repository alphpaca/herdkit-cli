import type { Command } from "commander";
import { render, Text, Box } from "ink";
import React from "react";
import { NodeFilesystem } from "~/kernel/filesystem";
import { checkConfigExists, buildConfig, writeConfig } from "./init_service";

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
                herdkit.yaml already exists in this directory. Initialization
                skipped.
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

export function registerInitCommand(program: Command): void {
    program
        .command("init")
        .description("Initialize a new herdkit project")
        .action(async () => {
            const cwd = process.cwd();
            const filesystem = new NodeFilesystem();

            try {
                const exists = await checkConfigExists(cwd, filesystem);
                if (exists) {
                    render(<ConfigExistsMessage />);
                    return;
                }

                const config = buildConfig([]);
                await writeConfig(cwd, config, filesystem);
                render(<ConfigCreatedMessage />);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred";
                render(<ErrorMessage message={message} />);
                process.exitCode = 1;
            }
        });
}
