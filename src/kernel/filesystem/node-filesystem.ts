import { stat, mkdir } from "node:fs/promises";
import type { Filesystem } from "./filesystem";

export class NodeFilesystem implements Filesystem {
    async fileExists(path: string): Promise<boolean> {
        return Bun.file(path).exists();
    }

    async directoryExists(path: string): Promise<boolean> {
        try {
            const info = await stat(path);
            return info.isDirectory();
        } catch {
            return false;
        }
    }

    async writeFile(path: string, content: string): Promise<void> {
        await Bun.write(path, content);
    }

    async createDirectory(path: string): Promise<void> {
        await mkdir(path, { recursive: true });
    }
}
