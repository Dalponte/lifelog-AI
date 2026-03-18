import { Injectable, Logger } from '@nestjs/common';
import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { ISystemSetup } from '../interfaces/system-setup.interface';

const LIFELOG_DIR = '.lifelog';

@Injectable()
export class LinuxSystemSetupService implements ISystemSetup {
  private readonly logger = new Logger(LinuxSystemSetupService.name);

  async isSoxInstalled(): Promise<boolean> {
    try {
      execSync('which sox', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async installSox(): Promise<void> {
    this.logger.log('Installing SoX and format libraries...');
    this.logger.log('Running: sudo apt install -y sox libsox-fmt-all');

    const result = spawnSync('sudo', ['apt', 'install', '-y', 'sox', 'libsox-fmt-all'], {
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      throw new Error(`SoX installation failed with exit code ${result.status}`);
    }

    this.logger.log('SoX installed successfully.');
  }

  async isWhisperInstalled(): Promise<boolean> {
    try {
      execSync('which whisper', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async installWhisper(): Promise<void> {
    this.logger.log('Installing Whisper CLI prerequisites and pipx...');
    this.logger.log('Running: sudo apt install -y ffmpeg python3 pipx');

    const aptResult = spawnSync('sudo', ['apt', 'install', '-y', 'ffmpeg', 'python3', 'pipx'], {
      stdio: 'inherit',
    });

    if (aptResult.status !== 0) {
      throw new Error(`Apt installation failed with exit code ${aptResult.status}`);
    }

    this.logger.log('Ensuring pipx path...');
    spawnSync('pipx', ['ensurepath'], { stdio: 'inherit' });

    this.logger.log('Installing openai-whisper via pipx...');
    const pipxResult = spawnSync('pipx', ['install', 'openai-whisper'], {
      stdio: 'inherit',
    });

    if (pipxResult.status !== 0) {
      throw new Error(`Whisper installation failed with exit code ${pipxResult.status}`);
    }

    this.logger.log('Whisper installed successfully.');
  }

  async ensureLifelogDir(): Promise<{ created: boolean; path: string }> {
    const lifelogPath = join(homedir(), LIFELOG_DIR);

    if (existsSync(lifelogPath)) {
      return { created: false, path: lifelogPath };
    }

    mkdirSync(lifelogPath, { recursive: true });
    this.logger.log(`Created directory: ${lifelogPath}`);
    return { created: true, path: lifelogPath };
  }
}
