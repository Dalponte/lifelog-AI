import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { StartRecordingCommand } from '../commands/start-recording.command';
import { IAudioRecorder, RecordingOptions } from '../interfaces';
import { IRecordingConfig } from '../interfaces/recording-config.interface';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

const LIFELOG_DIR = '.lifelog';

@CommandHandler(StartRecordingCommand)
export class StartRecordingHandler implements ICommandHandler<StartRecordingCommand> {
  private readonly logger = new Logger(StartRecordingHandler.name);

  constructor(
    private readonly audioRecorder: IAudioRecorder,
    private readonly recordingConfig: IRecordingConfig,
  ) {}

  async execute(command: StartRecordingCommand): Promise<void> {
    const lifelogPath = join(homedir(), LIFELOG_DIR);

    if (!existsSync(lifelogPath)) {
      this.logger.error(`Lifelog directory not found: ${lifelogPath}`);
      this.logger.error('Please run "lifelog setup" first to create the directory and install dependencies.');
      return;
    }

    const defaults = this.recordingConfig.getDefaults();
    
    const options: RecordingOptions = {
      sessionName: command.options.sessionName ?? defaults.sessionName,
      outputPath: lifelogPath,
      gain: command.options.gain ?? defaults.gain,
      rate: command.options.rate ?? defaults.rate,
      channels: command.options.channels ?? defaults.channels,
      threshold: command.options.threshold ?? defaults.threshold,
      recorderType: command.options.recorderType ?? defaults.recorderType,
    };

    this.logger.log(`Starting recording session: ${options.sessionName || 'default'}`);
    this.logger.log(`  Recorder:  ${options.recorderType}`);
    this.logger.log(`  Output:    ${options.outputPath}`);
    this.logger.log(`  Rate:      ${options.rate} Hz`);
    this.logger.log(`  Channels:  ${options.channels}`);
    this.logger.log(`  Gain:      ${options.gain} dB`);
    this.logger.log(`  Threshold: ${options.threshold}`);

    await this.audioRecorder.start(options);
  }
}
