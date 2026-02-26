export const CONFIG_FILENAME = "herdkit.yaml";

export type HerdkitConfig = {
  monorepo: {
    paths: string[];
  };
};
