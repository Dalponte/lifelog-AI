import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { homedir } from 'os';
import { join } from 'path';
import { IAudioTranscriber } from '../interfaces/audio-transcriber.interface';

const execAsync = promisify(exec);

@Injectable()
export class WhisperTranscriberService implements IAudioTranscriber {
  private readonly logger = new Logger(WhisperTranscriberService.name);

  async transcribe(filePath: string): Promise<{ transcriptText: string; stderr: string }> {
    const pythonPath = join(homedir(), '.local', 'pipx', 'venvs', 'openai-whisper', 'bin', 'python');
    const pyScript = `import whisper, sys, warnings; warnings.filterwarnings("ignore"); model = whisper.load_model("small"); print(model.transcribe(sys.argv[1])["text"].strip())`;

    const { stdout, stderr } = await execAsync(`"${pythonPath}" -c '${pyScript}' "${filePath}"`);
    
    const transcriptText = stdout.trim().replace(/\n/g, ' ');
    return { transcriptText, stderr };
  }
}
