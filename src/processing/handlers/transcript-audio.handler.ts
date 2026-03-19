import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { TranscriptAudioCommand } from '../commands/transcript-audio.command';
import { CategorizeTranscriptionCommand } from '../commands/categorize-transcription.command';
import { IDatabaseRepository } from '../../shared/database/interfaces/database-repository.interface';
import { IAudioTranscriber } from '../interfaces/audio-transcriber.interface';

@CommandHandler(TranscriptAudioCommand)
export class TranscriptAudioHandler implements ICommandHandler<TranscriptAudioCommand> {
  private readonly logger = new Logger(TranscriptAudioHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly databaseService: IDatabaseRepository,
    private readonly audioTranscriber: IAudioTranscriber,
  ) {}

  async execute(command: TranscriptAudioCommand): Promise<void> {
    this.logger.log(`Transcribing audio file: ${command.fileName} from path: ${command.filePath}`);
    
    try {
      this.logger.log(`Starting Whisper adapter for ${command.fileName}...`);
      
      const { transcriptText, stderr } = await this.audioTranscriber.transcribe(command.filePath);
      
      if (stderr) this.logger.debug(`Whisper adapter output: ${stderr}`);

      this.logger.debug(`Extracted transcript length: ${transcriptText.length} chars`);
      
      // Store transcript in the database
      this.databaseService.updateTranscription(command.fileName, transcriptText);

      this.logger.log(`Transcription succeeded for ${command.fileName}. Dispatching CategorizeTranscriptionCommand.`);
      
      // Trigger the next command in the pipeline
      await this.commandBus.execute(
        new CategorizeTranscriptionCommand(command.fileName),
      );

    } catch (error) {
      this.logger.error(`Transcription failed for ${command.fileName}: ${error.message}`);
    }
  }
}
