import type { Filesystem } from "./filesystem";

export class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();
  private directories = new Set<string>();

  async fileExists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async directoryExists(path: string): Promise<boolean> {
    return this.directories.has(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async createDirectory(path: string): Promise<void> {
    this.directories.add(path);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    }
    return content;
  }

  async readDirectory(path: string): Promise<string[]> {
    if (!this.directories.has(path)) {
      throw new Error(`ENOENT: no such file or directory, scandir '${path}'`);
    }
    const prefix = path.endsWith("/") ? path : `${path}/`;
    const entries = new Set<string>();
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const relative = filePath.slice(prefix.length);
        const firstSegment = relative.split("/")[0];
        entries.add(firstSegment);
      }
    }
    for (const dirPath of this.directories) {
      if (dirPath.startsWith(prefix)) {
        const relative = dirPath.slice(prefix.length);
        const firstSegment = relative.split("/")[0];
        if (firstSegment) {
          entries.add(firstSegment);
        }
      }
    }
    return Array.from(entries);
  }

  getFileContent(path: string): string | undefined {
    return this.files.get(path);
  }

  addFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  addDirectory(path: string): void {
    this.directories.add(path);
  }
}
