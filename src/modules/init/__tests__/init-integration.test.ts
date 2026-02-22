import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeFilesystem } from "~/kernel/filesystem";
import {
    checkConfigExists,
    buildConfig,
    writeConfig,
    createPackageDirectory,
} from "~/modules/init/init_service";

describe("init integration", () => {
    let tempDir: string;
    const filesystem = new NodeFilesystem();

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "herdkit-test-"));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    test("full init flow: creates config and directory", async () => {
        expect(await checkConfigExists(tempDir, filesystem)).toBe(false);

        await createPackageDirectory(tempDir, "packages", filesystem);

        const dirStat = await stat(join(tempDir, "packages"));
        expect(dirStat.isDirectory()).toBe(true);

        const config = buildConfig(["packages"]);
        await writeConfig(tempDir, config, filesystem);

        expect(await checkConfigExists(tempDir, filesystem)).toBe(true);

        const content = await readFile(
            join(tempDir, "herdkit.yaml"),
            "utf-8",
        );
        expect(content).toContain("monorepo:");
        expect(content).toContain("- packages");
    });

    test("full init flow: creates config with empty paths", async () => {
        const config = buildConfig([]);
        await writeConfig(tempDir, config, filesystem);

        const content = await readFile(
            join(tempDir, "herdkit.yaml"),
            "utf-8",
        );
        expect(content).toContain("paths: []");
    });
});
