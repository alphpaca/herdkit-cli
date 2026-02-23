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
