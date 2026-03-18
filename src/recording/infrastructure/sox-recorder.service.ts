import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, spawn } from 'child_process';
import { IAudioRecorder, RecordingOptions } from '../interfaces';
import { format } from 'date-fns';

@Injectable()
export class SoxRecorderService implements IAudioRecorder {
  private readonly logger = new Logger(SoxRecorderService.name);
  private recordProcess: ChildProcess | null = null;

  async start(options: RecordingOptions): Promise<void> {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    const sessionSuffix = options.sessionName ? `_${options.sessionName}` : '';
    const filename = `rec_${timestamp}${sessionSuffix}_%03d.wav`;
    const outputFile = `${options.outputPath}/${filename}`;

    const args = [
      '-r', options.rate.toString(),
      '-c', options.channels.toString(),
      '-b', '16',
      outputFile,
      'gain', options.gain,
      'silence', '1', '0.1', options.threshold,
      '3.0', '2.0', options.threshold,
      ':', 'newfile', ':', 'restart',
    ];

    this.logger.log(`Sox command: rec ${args.join(' ')}`);

    return new Promise<void>((resolve, reject) => {
      this.recordProcess = spawn('rec', args, {
        cwd: options.outputPath,
        stdio: 'inherit',
      });

      this.recordProcess.on('error', (err) => {
        this.logger.error(`Sox process error: ${err.message}`);
        this.recordProcess = null;
        reject(err);
      });

      this.recordProcess.on('close', (code) => {
        this.logger.log(`Sox process exited with code ${code}`);
        this.recordProcess = null;
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.recordProcess) {
      this.logger.log('Stopping Sox recording process...');
      this.recordProcess.kill('SIGINT');
      this.recordProcess = null;
    }
  }
}
