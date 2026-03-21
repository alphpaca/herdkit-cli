import { CONFIG_FILENAME, type HerdkitConfig } from "~/kernel/config/herdkit_config";
import type { Filesystem } from "~/kernel/filesystem";
import { parse } from "yaml";

export async function readConfig(cwd: string, filesystem: Filesystem): Promise<HerdkitConfig> {
  const configPath = `${cwd}/${CONFIG_FILENAME}`;
  const exists = await filesystem.fileExists(configPath);
  if (!exists) {
    throw new Error(`Config file not found: ${CONFIG_FILENAME}`);
  }

  const content = await filesystem.readFile(configPath);
  const parsed = parse(content) as HerdkitConfig;

  return parsed;
}
