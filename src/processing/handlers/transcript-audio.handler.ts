import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranscriptAudioCommand } from '../commands/transcript-audio.command';
import { CategorizeTranscriptionCommand } from '../commands/categorize-transcription.command';

@CommandHandler(TranscriptAudioCommand)
export class TranscriptAudioHandler implements ICommandHandler<TranscriptAudioCommand> {
  private readonly logger = new Logger(TranscriptAudioHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: TranscriptAudioCommand): Promise<void> {
    this.logger.log(`Transcribing audio file: ${command.fileName} from path: ${command.filePath}`);
    
    // Simulate transcribing process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const mockedTranscript = `[Mocked Transcript of ${command.fileName}]: I had a great idea today about a new project.`;

    this.logger.log(`Transcription succeeded for ${command.fileName}. Dispatching CategorizeTranscriptionCommand.`);
    
    // Trigger the next command in the pipeline
    await this.commandBus.execute(
      new CategorizeTranscriptionCommand(mockedTranscript, command.fileName),
    );
  }
}
