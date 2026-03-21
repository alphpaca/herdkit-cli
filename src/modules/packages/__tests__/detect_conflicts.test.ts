import { describe, test, expect } from "bun:test";
import { detectConflicts } from "~/modules/packages/services/detect_conflicts";
import type { Package } from "~/modules/packages/models/package";

function makePackage(
  name: string,
  deps: Record<string, string> = {},
  devDeps: Record<string, string> = {},
): Package {
  return { name, path: `packages/${name}`, dependencies: deps, devDependencies: devDeps };
}

describe("detectConflicts", () => {
  test("returns no conflicts when all packages share identical constraints", () => {
    const packages = [
      makePackage("a", { "symfony/console": "^8.0" }),
      makePackage("b", { "symfony/console": "^8.0" }),
    ];

    const conflicts = detectConflicts(packages);

    expect(conflicts).toEqual([]);
  });

  test("detects conflict when two packages differ on the same dependency", () => {
    const packages = [
      makePackage("a", { "symfony/console": "^8.0" }),
      makePackage("b", { "symfony/console": "^8.1" }),
    ];

    const conflicts = detectConflicts(packages);

    expect(conflicts).toEqual([
      {
        dependency: "symfony/console",
        versions: [
          { constraint: "^8.0", packages: ["a"] },
          { constraint: "^8.1", packages: ["b"] },
        ],
      },
    ]);
  });

  test("detects conflict across require and require-dev", () => {
    const packages = [
      makePackage("a", { "symfony/console": "^8.0" }),
      makePackage("b", {}, { "symfony/console": "^7.0" }),
    ];

    const conflicts = detectConflicts(packages);

    expect(conflicts).toEqual([
      {
        dependency: "symfony/console",
        versions: [
          { constraint: "^8.0", packages: ["a"] },
          { constraint: "^7.0", packages: ["b"] },
        ],
      },
    ]);
  });

  test("does not report conflicts for non-package entries filtered by detectPackages", () => {
    const packages = [
      makePackage("a", { "symfony/console": "^8.0" }),
      makePackage("b", { "symfony/console": "^8.0" }),
    ];

    const conflicts = detectConflicts(packages);

    expect(conflicts).toEqual([]);
  });

  test("handles packages with no dependencies without error", () => {
    const packages = [makePackage("a"), makePackage("b")];

    const conflicts = detectConflicts(packages);

    expect(conflicts).toEqual([]);
  });
});
