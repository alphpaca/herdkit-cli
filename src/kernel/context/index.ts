export { type CommandContext, type RenderFunction } from "./command_context";

import { render } from "ink";
import { NodeFilesystem } from "~/kernel/filesystem";
import type { CommandContext } from "./command_context";

export function createCommandContext(): CommandContext {
  return {
    cwd: process.cwd(),
    filesystem: new NodeFilesystem(),
    render,
  };
}
