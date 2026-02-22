import type { Command } from "commander";
import { render, Text, Box } from "ink";
import TextInput from "ink-text-input";
import React, { useState } from "react";
import { NodeFilesystem } from "../../kernel/filesystem";
import {
    checkConfigExists,
    buildConfig,
    writeConfig,
    createPackageDirectory,
} from "./init_service";
import type { Filesystem } from "../../kernel/filesystem";

type InitFlowProps = {
    cwd: string;
    filesystem: Filesystem;
};

type Step = "prompt-path" | "confirm-create" | "done";

function InitFlow({ cwd, filesystem }: InitFlowProps) {
    const [step, setStep] = useState<Step>("prompt-path");
    const [pathValue, setPathValue] = useState("");
    const [pendingPath, setPendingPath] = useState("");
    const [message, setMessage] = useState("");

    const handlePathSubmit = async (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) {
            const config = buildConfig([]);
            await writeConfig(cwd, config, filesystem);
            setMessage("Created herdkit.yaml with empty monorepo.paths.");
            setStep("done");
            return;
        }

        const exists = await filesystem.directoryExists(`${cwd}/${trimmed}`);
        if (exists) {
            const config = buildConfig([trimmed]);
            await writeConfig(cwd, config, filesystem);
            setMessage(`Created herdkit.yaml with monorepo.paths: [${trimmed}]`);
            setStep("done");
        } else {
            setPendingPath(trimmed);
            setStep("confirm-create");
        }
    };

    const handleConfirm = async (value: string) => {
        const answer = value.trim().toLowerCase();

        if (answer === "y" || answer === "yes") {
            await createPackageDirectory(cwd, pendingPath, filesystem);
            const config = buildConfig([pendingPath]);
            await writeConfig(cwd, config, filesystem);
            setMessage(
                `Created directory "${pendingPath}" and herdkit.yaml with monorepo.paths: [${pendingPath}]`,
            );
        } else {
            const config = buildConfig([]);
            await writeConfig(cwd, config, filesystem);
            setMessage("Created herdkit.yaml with empty monorepo.paths.");
        }
        setStep("done");
    };

    if (step === "prompt-path") {
        return (
            <Box flexDirection="column">
                <Text>Where do you want to store your packages?</Text>
                <Box>
                    <Text>Path: </Text>
                    <TextInput
                        value={pathValue}
                        onChange={setPathValue}
                        onSubmit={handlePathSubmit}
                    />
                </Box>
            </Box>
        );
    }

    if (step === "confirm-create") {
        return (
            <Box flexDirection="column">
                <Text>
                    Directory "{pendingPath}" does not exist. Create it? (y/n)
                </Text>
                <TextInput value="" onChange={() => {}} onSubmit={handleConfirm} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Text color="green">{message}</Text>
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

            render(<InitFlow cwd={cwd} filesystem={filesystem} />);
        });
}
