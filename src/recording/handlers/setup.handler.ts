import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SetupCommand } from '../commands/setup.command';
import { ISystemSetup } from '../interfaces/system-setup.interface';
import * as readline from 'readline';

@CommandHandler(SetupCommand)
export class SetupHandler implements ICommandHandler<SetupCommand> {
  private readonly logger = new Logger(SetupHandler.name);

  constructor(
    @Inject(ISystemSetup)
    private readonly systemSetup: ISystemSetup,
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

    // --- Step 2: ~/.lifelog directory ---
    const dirResult = await this.systemSetup.ensureLifelogDir();

    if (dirResult.created) {
      console.log(`✅ Created lifelog directory: ${dirResult.path}`);
    } else {
      console.log(`✅ Lifelog directory already exists: ${dirResult.path}`);
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
