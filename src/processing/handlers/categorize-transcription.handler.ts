import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CategorizeTranscriptionCommand } from '../commands/categorize-transcription.command';

@CommandHandler(CategorizeTranscriptionCommand)
export class CategorizeTranscriptionHandler implements ICommandHandler<CategorizeTranscriptionCommand> {
  private readonly logger = new Logger(CategorizeTranscriptionHandler.name);

  async execute(command: CategorizeTranscriptionCommand): Promise<void> {
    this.logger.log(`Categorizing transcript for file: ${command.originalFileName}`);
    this.logger.debug(`Transcript length: ${command.transcriptText.length} chars`);
    
    // Simulate categorization and DB storage
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.logger.log(`Successfully categorized and stored data for ${command.originalFileName}`);
  }
}
