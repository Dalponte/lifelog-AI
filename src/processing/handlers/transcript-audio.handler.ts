import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranscriptAudioCommand } from '../commands/transcript-audio.command';
import { CategorizeTranscriptionCommand } from '../commands/categorize-transcription.command';
import { DatabaseService } from '../../shared/database/database.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, rmSync } from 'fs';
import { homedir, tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

@CommandHandler(TranscriptAudioCommand)
export class TranscriptAudioHandler implements ICommandHandler<TranscriptAudioCommand> {
  private readonly logger = new Logger(TranscriptAudioHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly databaseService: DatabaseService,
  ) {}

  async execute(command: TranscriptAudioCommand): Promise<void> {
    this.logger.log(`Transcribing audio file: ${command.fileName} from path: ${command.filePath}`);
    
    try {
      this.logger.log(`Starting Whisper Python API (small model on GPU) for ${command.fileName}...`);
      
      const pythonPath = join(homedir(), '.local', 'pipx', 'venvs', 'openai-whisper', 'bin', 'python');
      const pyScript = `import whisper, sys, warnings; warnings.filterwarnings("ignore"); model = whisper.load_model("small"); print(model.transcribe(sys.argv[1])["text"].strip())`;

      const { stdout, stderr } = await execAsync(`"${pythonPath}" -c '${pyScript}' "${command.filePath}"`);
      
      if (stderr) this.logger.debug(`Whisper stderr: ${stderr}`);

      const transcriptText = stdout.trim().replace(/\n/g, ' ');
      this.logger.debug(`Extracted transcript length: ${transcriptText.length} chars`);
      
      // Store transcript in the database
      this.databaseService.updateTranscript(command.fileName, transcriptText);

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
