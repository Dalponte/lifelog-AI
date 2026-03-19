import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { ProcessCommand } from '../commands/process.command';
import { TranscriptAudioCommand } from '../../processing/commands/transcript-audio.command';
import { IDatabaseRepository } from '../../shared/database/interfaces/database-repository.interface';
import { readdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LIFELOG_DIR = '.lifelog';

@CommandHandler(ProcessCommand)
export class ProcessHandler implements ICommandHandler<ProcessCommand> {
  private readonly logger = new Logger(ProcessHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly databaseService: IDatabaseRepository,
  ) {}

  async execute(command: ProcessCommand): Promise<void> {
    const lifelogPath = join(homedir(), LIFELOG_DIR);
    this.logger.log(`Scanning directory: ${lifelogPath} for .wav files to process...`);

    try {
      const files = readdirSync(lifelogPath);
      const wavFiles = files.filter(f => f.endsWith('.wav'));

      if (wavFiles.length === 0) {
        this.logger.log('No .wav files found to process.');
        return;
      }

      this.logger.log(`Found ${wavFiles.length} file(s) in directory...`);
      let processedCount = 0;
      
      for (const fileName of wavFiles) {
        if (this.databaseService.isProcessed(fileName)) {
          this.logger.debug(`Skipping already processed file: ${fileName}`);
          continue;
        }

        const filePath = join(lifelogPath, fileName);
        this.logger.log(`Processing new file: ${fileName}`);

        // Extract metadata: rec_MM-dd_HHmm_[sessionName]_001.wav
        // e.g. "rec_10-25_1430_MySession_001.wav" or "rec_10-25_1430_001.wav"
        const parts = fileName.replace('.wav', '').split('_');
        // parts[0] = 'rec'
        // parts[1] = 'MM-dd'
        // parts[2] = 'HHmm'
        
        let datetime = 'unknown';
        let session = 'default';
        
        if (parts.length >= 3) {
          datetime = `${parts[1]}_${parts[2]}`;
        }
        
        if (parts.length > 4) {
          session = parts.slice(3, parts.length - 1).join('_');
        }

        this.databaseService.insertTranscription({
          filename: fileName,
          session,
          datetime,
        });
        
        await this.commandBus.execute(new TranscriptAudioCommand(filePath, fileName));
        processedCount++;
      }
      
      this.logger.log(`Processed ${processedCount} new file(s) successfully.`);
      
    } catch (error) {
      this.logger.error(`Error processing files: ${error.message}`);
    }
  }
}
