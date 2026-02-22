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

export function registerInitCommand(program: Command): void {
    program
        .command("init")
        .description("Initialize a new herdkit project")
        .action(async () => {
            const cwd = process.cwd();
            const filesystem = new NodeFilesystem();

            const exists = await checkConfigExists(cwd, filesystem);
            if (exists) {
                render(<ConfigExistsMessage />);
                return;
            }

            const config = buildConfig([]);
            await writeConfig(cwd, config, filesystem);
            render(<ConfigCreatedMessage />);
        });
}
