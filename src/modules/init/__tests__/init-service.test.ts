import { describe, test, expect } from "bun:test";
import { FakeFilesystem } from "~/kernel/filesystem";
import { checkConfigExists, buildConfig, writeConfig } from "~/modules/init/init_service";

describe("checkConfigExists", () => {
  test("returns true when herdkit.yaml exists", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/project/herdkit.yaml", "content");

    expect(await checkConfigExists("/project", fs)).toBe(true);
  });

  test("returns false when herdkit.yaml does not exist", async () => {
    const fs = new FakeFilesystem();

    expect(await checkConfigExists("/project", fs)).toBe(false);
  });
});

describe("buildConfig", () => {
  test("builds config with a single path", () => {
    const config = buildConfig(["packages"]);

    expect(config).toEqual({
      monorepo: { paths: ["packages"] },
    });
  });

  test("builds config with empty paths", () => {
    const config = buildConfig([]);

    expect(config).toEqual({
      monorepo: { paths: [] },
    });
  });
});

describe("writeConfig", () => {
  test("writes YAML to herdkit.yaml", async () => {
    const fs = new FakeFilesystem();
    const config = buildConfig(["packages"]);

    await writeConfig("/project", config, fs);

    const content = fs.getFileContent("/project/herdkit.yaml");
    expect(content).toContain("monorepo:");
    expect(content).toContain("paths:");
    expect(content).toContain("- packages");
  });

  test("writes empty paths as empty array", async () => {
    const fs = new FakeFilesystem();
    const config = buildConfig([]);

    await writeConfig("/project", config, fs);

    const content = fs.getFileContent("/project/herdkit.yaml");
    expect(content).toContain("monorepo:");
    expect(content).toContain("paths: []");
  });
});
