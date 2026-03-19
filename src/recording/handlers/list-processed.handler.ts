import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { ListProcessedCommand } from '../commands/list-processed.command';
import { IDatabaseRepository } from '../../shared/database/interfaces/database-repository.interface';

@CommandHandler(ListProcessedCommand)
export class ListProcessedHandler implements ICommandHandler<ListProcessedCommand> {
  private readonly logger = new Logger(ListProcessedHandler.name);

  constructor(private readonly databaseService: IDatabaseRepository) {}

  async execute(command: ListProcessedCommand): Promise<void> {
    this.logger.log('Fetching processed audio files from the database...\n');
    
    try {
      const transcriptions = this.databaseService.getTranscriptions();
      
      if (transcriptions.length === 0) {
        console.log('No processed audio files found in the database.');
        return;
      }
      
      console.table(transcriptions);
    } catch (error) {
      this.logger.error(`Error fetching processed files: ${error.message}`);
    }
  }
}
