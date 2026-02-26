#!/usr/bin/env node
import { Command } from "commander";
import { createCommandContext } from "~/kernel/context";
import { registerInitCommand } from "~/modules/init";

const program = new Command();

program.name("herdkit").description("PHP monorepo management tool").version("0.1.0");

const ctx = createCommandContext();
registerInitCommand(program, ctx);

program.parse();
