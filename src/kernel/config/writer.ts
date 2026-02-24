import { CONFIG_FILENAME, HerdkitConfig } from "~/kernel/config/herdkit_config";
import type { Filesystem } from "~/kernel/filesystem";
import { stringify } from "yaml";

export async function writeConfig(
  cwd: string,
  config: HerdkitConfig,
  filesystem: Filesystem,
): Promise<void> {
  const yaml = stringify(config);
  await filesystem.writeFile(`${cwd}/${CONFIG_FILENAME}`, yaml);
}
