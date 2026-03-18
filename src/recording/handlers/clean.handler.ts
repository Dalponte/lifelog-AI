import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CleanCommand } from '../commands/clean.command';
import { IFileCleaner } from '../interfaces/file-cleaner.interface';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import * as readline from 'readline';

const LIFELOG_DIR = '.lifelog';

@CommandHandler(CleanCommand)
export class CleanHandler implements ICommandHandler<CleanCommand> {
  private readonly logger = new Logger(CleanHandler.name);

  constructor(
    @Inject(IFileCleaner)
    private readonly fileCleaner: IFileCleaner,
  ) {}

  async execute(command: CleanCommand): Promise<void> {
    const lifelogPath = join(homedir(), LIFELOG_DIR);

    if (!existsSync(lifelogPath)) {
      this.logger.error(`Lifelog directory not found: ${lifelogPath}`);
      this.logger.error('Please run "lifelog setup" first to create the directory.');
      return;
    }

    // --- List files ---
    const files = await this.fileCleaner.listFiles(lifelogPath);

    if (files.length === 0) {
      console.log('✅ No files to clean. Directory is already empty.');
      return;
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    console.log(`\n📁 Found ${files.length} file(s) in ${lifelogPath}:\n`);
    for (const file of files) {
      console.log(`   ${file.name}  (${this.formatSize(file.size)})`);
    }
    console.log(`\n   Total: ${this.formatSize(totalSize)}\n`);

    // --- Confirm unless --force ---
    if (!command.options.force) {
      const confirmed = await this.askConfirmation(
        '⚠️  Delete all files? This cannot be undone. [y/N]: ',
      );

      if (!confirmed) {
        console.log('⏭️  Cleanup cancelled.');
        return;
      }
    }

    // --- Delete ---
    const result = await this.fileCleaner.deleteFiles(lifelogPath);

    console.log(
      `\n🧹 Cleaned ${result.deletedFiles.length} file(s), freed ${this.formatSize(result.totalSize)}.`,
    );
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  private askConfirmation(prompt: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        const normalized = answer.trim().toLowerCase();
        resolve(normalized === 'y' || normalized === 'yes');
      });
    });
  }
}
