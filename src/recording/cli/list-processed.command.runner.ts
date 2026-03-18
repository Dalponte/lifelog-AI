import { CommandRunner, Command } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ListProcessedCommand } from '../commands/list-processed.command';

@Injectable()
@Command({
  name: 'list',
  description: 'List all processed audio files from the database',
})
export class ListProcessedCommandRunner extends CommandRunner {
  private readonly logger = new Logger(ListProcessedCommandRunner.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.commandBus.execute(new ListProcessedCommand());
    } catch (error) {
      this.logger.error('Failed to list processed files', error.stack);
      process.exit(1);
    }
  }
}
