import type { Package } from "~/modules/packages/models/package";
import type { DependencyConflict } from "~/modules/packages/models/dependency_conflict";

export function detectConflicts(packages: Package[]): DependencyConflict[] {
  const depMap = new Map<string, Map<string, string[]>>();

  for (const pkg of packages) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const [dep, constraint] of Object.entries(allDeps)) {
      if (!depMap.has(dep)) {
        depMap.set(dep, new Map());
      }
      const constraintMap = depMap.get(dep)!;
      if (!constraintMap.has(constraint)) {
        constraintMap.set(constraint, []);
      }
      constraintMap.get(constraint)!.push(pkg.name);
    }
  }

  const conflicts: DependencyConflict[] = [];

  for (const [dep, constraintMap] of depMap) {
    if (constraintMap.size > 1) {
      conflicts.push({
        dependency: dep,
        versions: Array.from(constraintMap.entries()).map(([constraint, pkgs]) => ({
          constraint,
          packages: pkgs,
        })),
      });
    }
  }

  return conflicts.sort((a, b) => a.dependency.localeCompare(b.dependency));
}
