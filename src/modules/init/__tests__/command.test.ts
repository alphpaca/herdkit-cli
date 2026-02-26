import { describe, test, expect } from "bun:test";
import { FakeFilesystem } from "~/kernel/filesystem";
import { prepareCommand } from "~/kernel/testing";
import { registerInitCommand } from "~/modules/init";

describe("init command", () => {
  test("creates herdkit.yaml and renders success message", async () => {
    const { run, lastFrame, filesystem } = prepareCommand(registerInitCommand);

    await run("init");

    expect(lastFrame()).toContain("Created herdkit.yaml");
    expect(filesystem.getFileContent("/test/herdkit.yaml")).toContain("monorepo:");
  });

  test("skips creation when config already exists", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "existing content");

    const { run, lastFrame, filesystem } = prepareCommand(registerInitCommand, {
      filesystem: fs,
    });

    await run("init");

    expect(lastFrame()).toContain("already exists");
    expect(filesystem.getFileContent("/test/herdkit.yaml")).toBe("existing content");
  });

  test("renders error message and sets exit code when write fails", async () => {
    const fs = new FakeFilesystem();
    fs.writeFile = async () => {
      throw new Error("Permission denied");
    };

    const previousExitCode = process.exitCode;

    const { run, lastFrame } = prepareCommand(registerInitCommand, {
      filesystem: fs,
    });

    await run("init");

    expect(lastFrame()).toContain("Error: Permission denied");
    expect(process.exitCode).toBe(1);

    process.exitCode = previousExitCode ?? 0;
  });
});
