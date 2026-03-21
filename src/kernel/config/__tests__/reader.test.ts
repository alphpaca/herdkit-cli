import { describe, test, expect } from "bun:test";
import { FakeFilesystem } from "~/kernel/filesystem";
import { readConfig } from "~/kernel/config";

describe("readConfig", () => {
  test("parses valid herdkit.yaml", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", "monorepo:\n  paths:\n    - packages\n    - libs\n");

    const config = await readConfig("/test", fs);

    expect(config.monorepo.paths).toEqual(["packages", "libs"]);
  });

  test("throws when config file does not exist", async () => {
    const fs = new FakeFilesystem();

    expect(readConfig("/test", fs)).rejects.toThrow("Config file not found");
  });

  test("throws when config file contains invalid YAML", async () => {
    const fs = new FakeFilesystem();
    fs.addFile("/test/herdkit.yaml", ":\ninvalid: [yaml: {{{");

    expect(readConfig("/test", fs)).rejects.toThrow();
  });
});
