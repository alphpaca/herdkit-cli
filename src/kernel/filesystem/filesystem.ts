export interface Filesystem {
  fileExists(path: string): Promise<boolean>;
  directoryExists(path: string): Promise<boolean>;
  writeFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  readFile(path: string): Promise<string>;
  readDirectory(path: string): Promise<string[]>;
}
