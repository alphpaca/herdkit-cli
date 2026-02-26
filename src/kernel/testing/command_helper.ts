import { Command } from "commander";
import { render } from "ink-testing-library";
import { FakeFilesystem } from "~/kernel/filesystem";
import type { CommandContext } from "~/kernel/context";

type CommandTestHarness = {
  program: Command;
  context: CommandContext;
  filesystem: FakeFilesystem;
  run: (...args: string[]) => Promise<void>;
  lastFrame: () => string | undefined;
};

export function prepareCommand(
  register: (program: Command, ctx: CommandContext) => void,
  overrides?: Partial<CommandContext>,
): CommandTestHarness {
  const program = new Command();
  program.exitOverride();
  program.configureOutput({ writeOut: () => {}, writeErr: () => {} });

  let lastFrameFn: () => string | undefined = () => undefined;

  const context: CommandContext = {
    cwd: "/test",
    filesystem: new FakeFilesystem(),
    render: (element) => {
      const instance = render(element);
      lastFrameFn = () => instance.lastFrame();
      return instance;
    },
    ...overrides,
  };

  register(program, context);

  return {
    program,
    context,
    filesystem: context.filesystem as FakeFilesystem,
    run: async (...args) => {
      await program.parseAsync(args, { from: "user" });
    },
    lastFrame: () => lastFrameFn(),
  };
}
