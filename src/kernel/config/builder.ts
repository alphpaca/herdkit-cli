import {HerdkitConfig} from "~/kernel/config/herdkit_config";

export function buildConfig(paths: string[]): HerdkitConfig {
  return {
    monorepo: {
      paths,
    },
  };
}
