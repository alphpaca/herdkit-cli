import { describe, test, expect } from "bun:test";
import { FakeFilesystem } from "~/kernel/filesystem";
import { prepareCommand } from "~/kernel/testing";
import { registerPackagesCommand } from "~/modules/packages";

describe("packages verify command", () => {
  test("renders conflicts and sets exit code when mismatches found", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "monorepo:\n  paths:\n    - packages\n");
    fs.addDirectory("/test/packages");
    fs.addFile(
      "/test/packages/alpha/composer.json",
      JSON.stringify({ name: "vendor/alpha", require: { "symfony/console": "^8.0" } }),
    );
    fs.addFile(
      "/test/packages/beta/composer.json",
      JSON.stringify({ name: "vendor/beta", require: { "symfony/console": "^8.1" } }),
    );

    const previousExitCode = process.exitCode;

    const { run, lastFrame } = prepareCommand(registerPackagesCommand, {
      filesystem: fs,
    });

    await run("packages", "verify");

    expect(lastFrame()).toContain("symfony/console");
    expect(lastFrame()).toContain("^8.0");
    expect(lastFrame()).toContain("^8.1");
    expect(lastFrame()).toContain("vendor/alpha");
    expect(lastFrame()).toContain("vendor/beta");
    expect(process.exitCode).toBe(1);

    process.exitCode = previousExitCode ?? 0;
  });

  test("renders success message when no conflicts", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "monorepo:\n  paths:\n    - packages\n");
    fs.addDirectory("/test/packages");
    fs.addFile(
      "/test/packages/alpha/composer.json",
      JSON.stringify({ name: "vendor/alpha", require: { "symfony/console": "^8.0" } }),
    );
    fs.addFile(
      "/test/packages/beta/composer.json",
      JSON.stringify({ name: "vendor/beta", require: { "symfony/console": "^8.0" } }),
    );

    const { run, lastFrame } = prepareCommand(registerPackagesCommand, {
      filesystem: fs,
    });

    await run("packages", "verify");

    expect(lastFrame()).toContain("All package dependencies are consistent");
  });
});
