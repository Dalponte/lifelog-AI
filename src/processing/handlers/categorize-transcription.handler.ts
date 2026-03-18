import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CategorizeTranscriptionCommand } from '../commands/categorize-transcription.command';
import { AiService } from '../../shared/ai/ai.service';
import { DatabaseService } from '../../shared/database/database.service';

@CommandHandler(CategorizeTranscriptionCommand)
export class CategorizeTranscriptionHandler implements ICommandHandler<CategorizeTranscriptionCommand> {
  private readonly logger = new Logger(CategorizeTranscriptionHandler.name);

  constructor(
    private readonly aiService: AiService,
    private readonly databaseService: DatabaseService,
  ) {}

  async execute(command: CategorizeTranscriptionCommand): Promise<void> {
    this.logger.log(`Categorizing transcript for ID: ${command.id}`);
    
    // Fetch raw transcription from database
    const record = this.databaseService.getTranscription(command.id);
    if (!record || !record.transcript || record.transcript.trim().length === 0) {
      this.logger.warn(`Skipping categorization for ${command.id}: record not found or transcript is empty.`);
      return;
    }
    
    this.logger.debug(`Transcript length: ${record.transcript.length} chars`);

    try {
      const metadata = await this.aiService.categorizeAndRestructure(record.transcript);
      
      const topicsStr = Array.isArray(metadata.topics) ? metadata.topics.join(', ') : 'None';
      this.logger.debug(`Extracted Category: ${metadata.category}`);
      this.logger.debug(`Extracted Topics: ${topicsStr}`);

      // Save the updated record back to SQLite
      this.databaseService.updateTranscriptionMetadata(command.id, {
        category: metadata.category,
        topics: JSON.stringify(metadata.topics),
        summary: metadata.summary,
        context: metadata.context,
        improvedText: metadata.improvedText,
      });
      
      this.logger.log(`Successfully categorized and stored data for ${command.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to categorize transcript for ${command.id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
