import { stringify } from "yaml";
import type { Filesystem } from "~/kernel/filesystem";
import type { HerdkitConfig } from "~/kernel/config";

const CONFIG_FILENAME = "herdkit.yaml";

export function checkConfigExists(cwd: string, filesystem: Filesystem): Promise<boolean> {
  return filesystem.fileExists(`${cwd}/${CONFIG_FILENAME}`);
}

export function buildConfig(paths: string[]): HerdkitConfig {
  return {
    monorepo: {
      paths,
    },
  };
}

export async function writeConfig(
  cwd: string,
  config: HerdkitConfig,
  filesystem: Filesystem,
): Promise<void> {
  const yaml = stringify(config);
  await filesystem.writeFile(`${cwd}/${CONFIG_FILENAME}`, yaml);
}
