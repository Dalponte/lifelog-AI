import { Injectable, Logger } from '@nestjs/common';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { IFileCleaner, CleanResult } from '../interfaces/file-cleaner.interface';

@Injectable()
export class FileCleanerService implements IFileCleaner {
  private readonly logger = new Logger(FileCleanerService.name);

  async listFiles(dirPath: string): Promise<{ name: string; size: number }[]> {
    const entries = readdirSync(dirPath);

    return entries
      .map((name) => {
        const fullPath = join(dirPath, name);
        const stat = statSync(fullPath);
        return { name, size: stat.size, isFile: stat.isFile() };
      })
      .filter((entry) => entry.isFile)
      .map(({ name, size }) => ({ name, size }));
  }

  async deleteFiles(dirPath: string): Promise<CleanResult> {
    const files = await this.listFiles(dirPath);
    const deletedFiles: string[] = [];
    let totalSize = 0;

    for (const file of files) {
      const fullPath = join(dirPath, file.name);
      try {
        unlinkSync(fullPath);
        deletedFiles.push(file.name);
        totalSize += file.size;
        this.logger.log(`Deleted: ${file.name}`);
      } catch (error) {
        this.logger.error(`Failed to delete ${file.name}: ${error}`);
      }
    }

    return { deletedFiles, totalSize };
  }
}
