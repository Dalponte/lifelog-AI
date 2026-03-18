import { CommandRunner, Command } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessCommand } from '../commands/process.command';

@Injectable()
@Command({
  name: 'process',
  description: 'Manually process all saved .wav files in the lifelog directory',
})
export class ProcessCommandRunner extends CommandRunner {
  private readonly logger = new Logger(ProcessCommandRunner.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Starting manual batch processing of audio files...');
      await this.commandBus.execute(new ProcessCommand());
    } catch (error) {
      this.logger.error('Processing failed', error.stack);
      process.exit(1);
    }
  }
}
