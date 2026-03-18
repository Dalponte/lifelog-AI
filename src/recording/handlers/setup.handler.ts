import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SetupCommand } from '../commands/setup.command';
import { ISystemSetup } from '../interfaces/system-setup.interface';
import { DatabaseService } from '../../shared/database/database.service';
import * as readline from 'readline';

@CommandHandler(SetupCommand)
export class SetupHandler implements ICommandHandler<SetupCommand> {
  private readonly logger = new Logger(SetupHandler.name);

  constructor(
    @Inject(ISystemSetup)
    private readonly systemSetup: ISystemSetup,
    private readonly databaseService: DatabaseService,
  ) {}

  async execute(_command: SetupCommand): Promise<void> {
    this.logger.log('Running setup...\n');

    // --- Step 1: SoX ---
    const soxInstalled = await this.systemSetup.isSoxInstalled();

    if (soxInstalled) {
      console.log('✅ SoX is already installed.');
    } else {
      console.log('⚠️  SoX is not installed.');
      const confirmSox = await this.askConfirmation(
        '   Install SoX? (sudo apt install sox libsox-fmt-all) [Y/n]: ',
      );

      if (confirmSox) {
        await this.systemSetup.installSox();
        console.log('✅ SoX installed successfully.');
      } else {
        console.log('⏭️  Skipped SoX installation.');
      }
    }

    // --- Step 1.5: Whisper ---
    const whisperInstalled = await this.systemSetup.isWhisperInstalled();

    if (whisperInstalled) {
      console.log('✅ Whisper (openai-whisper) is already installed.');
    } else {
      console.log('⚠️  Whisper CLI is not installed (or missing dependencies).');
      const confirmWhisper = await this.askConfirmation(
        '   Install openai-whisper via pipx? (sudo apt install ffmpeg python3 pipx && pipx install openai-whisper) [Y/n]: ',
      );

      if (confirmWhisper) {
        await this.systemSetup.installWhisper();
        console.log('✅ Whisper installed successfully.');
      } else {
        console.log('⏭️  Skipped Whisper installation.');
      }
    }

    // --- Step 2: ~/.lifelog directory ---
    const dirResult = await this.systemSetup.ensureLifelogDir();

    if (dirResult.created) {
      console.log(`✅ Created lifelog directory: ${dirResult.path}`);
    } else {
      console.log(`✅ Lifelog directory already exists: ${dirResult.path}`);
    }

    // --- Step 3: Database setup ---
    try {
      this.databaseService.initDb();
      console.log('✅ SQLite database initialized.');
    } catch (error) {
      console.log(`⚠️  Could not initialize database: ${error.message}`);
    }

    console.log('\n🎉 Setup complete! You can now run: lifelog start -s <session>');
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
        resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
      });
    });
  }
}
