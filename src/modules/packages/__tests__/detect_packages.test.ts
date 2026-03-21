import { describe, test, expect } from "bun:test";
import { FakeFilesystem } from "~/kernel/filesystem";
import { detectPackages } from "~/modules/packages/services/detect_packages";
import type { HerdkitConfig } from "~/kernel/config";

function makeConfig(paths: string[]): HerdkitConfig {
  return { monorepo: { paths } };
}

describe("detectPackages", () => {
  test("detects packages with composer.json", async () => {
    const fs = new FakeFilesystem();
    fs.addDirectory("/test/packages");
    fs.addFile("/test/packages/alpha/composer.json", JSON.stringify({ name: "vendor/alpha" }));
    fs.addFile("/test/packages/beta/composer.json", JSON.stringify({ name: "vendor/beta" }));

    const result = await detectPackages("/test", makeConfig(["packages"]), fs);

    expect(result).toEqual([
      { name: "vendor/alpha", path: "packages/alpha", dependencies: {}, devDependencies: {} },
      { name: "vendor/beta", path: "packages/beta", dependencies: {}, devDependencies: {} },
    ]);
  });

  test("returns empty array when no packages found", async () => {
    const fs = new FakeFilesystem();
    fs.addDirectory("/test/packages");
    fs.addDirectory("/test/packages/not-a-package");

    const result = await detectPackages("/test", makeConfig(["packages"]), fs);

    expect(result).toEqual([]);
  });

  test("skips missing configured paths", async () => {
    const fs = new FakeFilesystem();

    const result = await detectPackages("/test", makeConfig(["missing"]), fs);

    expect(result).toEqual([]);
  });

  test("extracts dependencies and devDependencies from composer.json", async () => {
    const fs = new FakeFilesystem();
    fs.addDirectory("/test/packages");
    fs.addFile(
      "/test/packages/alpha/composer.json",
      JSON.stringify({
        name: "vendor/alpha",
        require: { "symfony/console": "^8.0" },
        "require-dev": { "phpunit/phpunit": "^11.0" },
      }),
    );

    const result = await detectPackages("/test", makeConfig(["packages"]), fs);

    expect(result).toEqual([
      {
        name: "vendor/alpha",
        path: "packages/alpha",
        dependencies: { "symfony/console": "^8.0" },
        devDependencies: { "phpunit/phpunit": "^11.0" },
      },
    ]);
  });

  test("uses directory name when composer.json has invalid JSON", async () => {
    const fs = new FakeFilesystem();
    fs.addDirectory("/test/packages");
    fs.addFile("/test/packages/broken/composer.json", "not json");

    const result = await detectPackages("/test", makeConfig(["packages"]), fs);

    expect(result).toEqual([
      { name: "broken", path: "packages/broken", dependencies: {}, devDependencies: {} },
    ]);
  });

  test("uses directory name when composer.json has no name field", async () => {
    const fs = new FakeFilesystem();
    fs.addDirectory("/test/packages");
    fs.addFile("/test/packages/unnamed/composer.json", JSON.stringify({ description: "no name" }));

    const result = await detectPackages("/test", makeConfig(["packages"]), fs);

    expect(result).toEqual([
      { name: "unnamed", path: "packages/unnamed", dependencies: {}, devDependencies: {} },
    ]);
  });
});
