import type React from "react";
import type { Filesystem } from "~/kernel/filesystem";

export type RenderFunction = (element: React.ReactElement) => { unmount: () => void };

export type CommandContext = {
	cwd: string;
	filesystem: Filesystem;
	render: RenderFunction;
};
