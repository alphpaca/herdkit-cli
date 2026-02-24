#!/usr/bin/env node
import { Command } from "commander";
import { render, Text, Box } from "ink";
import React from "react";
import { createCommandContext } from "~/kernel/context";
import { registerInitCommand } from "~/modules/init";

const program = new Command();

program.name("herdkit").description("PHP monorepo management tool").version("0.1.0");

program
	.command("hello", { isDefault: true })
	.description("Say hello")
	.action(() => {
		render(
			<Box flexDirection="column" padding={1}>
				<Text bold color="green">
					🦙 Herdkit
				</Text>
				<Text dimColor>PHP monorepo management tool</Text>
			</Box>,
		);
	});

const ctx = createCommandContext();
registerInitCommand(program, ctx);

program.parse();
