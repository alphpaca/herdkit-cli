import {CONFIG_FILENAME} from "~/kernel/config/herdkit_config";
import {type Filesystem} from "~/kernel/filesystem";

export function checkConfigExists(cwd: string, filesystem: Filesystem): Promise<boolean> {
  return filesystem.fileExists(`${cwd}/${CONFIG_FILENAME}`);
}
