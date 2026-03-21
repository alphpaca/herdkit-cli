import { describe, test, expect } from "bun:test";
import { FakeFilesystem } from "~/kernel/filesystem";
import { prepareCommand } from "~/kernel/testing";
import { registerPackagesCommand } from "~/modules/packages";

describe("packages list command", () => {
  test("displays detected packages", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "monorepo:\n  paths:\n    - packages\n");
    fs.addDirectory("/test/packages");
    fs.addFile("/test/packages/my-lib/composer.json", JSON.stringify({ name: "vendor/my-lib" }));

    const { run, lastFrame } = prepareCommand(registerPackagesCommand, {
      filesystem: fs,
    });

    await run("packages", "list");

    expect(lastFrame()).toContain("vendor/my-lib");
    expect(lastFrame()).toContain("packages/my-lib");
  });

  test("displays no-packages message when none found", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "monorepo:\n  paths:\n    - packages\n");
    fs.addDirectory("/test/packages");

    const { run, lastFrame } = prepareCommand(registerPackagesCommand, {
      filesystem: fs,
    });

    await run("packages", "list");

    expect(lastFrame()).toContain("No packages found");
  });

  test("displays error when config file is missing", async () => {
    const previousExitCode = process.exitCode;

    const { run, lastFrame } = prepareCommand(registerPackagesCommand);

    await run("packages", "list");

    expect(lastFrame()).toContain("Error:");
    expect(lastFrame()).toContain("Config file not found");
    expect(process.exitCode).toBe(1);

    process.exitCode = previousExitCode ?? 0;
  });

  test("displays error message on unexpected error", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "monorepo:\n  paths:\n    - packages\n");
    fs.readDirectory = async () => {
      throw new Error("Unexpected failure");
    };
    fs.addDirectory("/test/packages");

    const previousExitCode = process.exitCode;

    const { run, lastFrame } = prepareCommand(registerPackagesCommand, {
      filesystem: fs,
    });

    await run("packages", "list");

    expect(lastFrame()).toContain("Error: Unexpected failure");
    expect(process.exitCode).toBe(1);

    process.exitCode = previousExitCode ?? 0;
  });
});
