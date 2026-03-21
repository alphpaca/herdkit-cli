export type DependencyConflict = {
  dependency: string;
  versions: { constraint: string; packages: string[] }[];
};
