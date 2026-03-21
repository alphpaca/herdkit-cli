import type { HerdkitConfig } from "~/kernel/config";
import type { Filesystem } from "~/kernel/filesystem";
import type { Package } from "~/modules/packages/models/package";

export async function detectPackages(
  cwd: string,
  config: HerdkitConfig,
  filesystem: Filesystem,
): Promise<Package[]> {
  const packages: Package[] = [];

  for (const configPath of config.monorepo.paths) {
    const fullPath = `${cwd}/${configPath}`;
    const exists = await filesystem.directoryExists(fullPath);
    if (!exists) {
      continue;
    }

    const entries = await filesystem.readDirectory(fullPath);
    for (const entry of entries) {
      const composerPath = `${fullPath}/${entry}/composer.json`;
      const hasComposer = await filesystem.fileExists(composerPath);
      if (!hasComposer) {
        continue;
      }

      let name = entry;
      try {
        const content = await filesystem.readFile(composerPath);
        const parsed = JSON.parse(content);
        if (typeof parsed.name === "string") {
          name = parsed.name;
        }
      } catch {
        // Fall back to directory name
      }

      packages.push({ name, path: `${configPath}/${entry}` });
    }
  }

  return packages;
}
