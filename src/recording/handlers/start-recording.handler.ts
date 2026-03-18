import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { StartRecordingCommand } from '../commands/start-recording.command';
import { IAudioRecorder, RecordingOptions } from '../interfaces';
import { RECORDING_DEFAULTS } from '../domain/recording-defaults';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

const LIFELOG_DIR = '.lifelog';

@CommandHandler(StartRecordingCommand)
export class StartRecordingHandler implements ICommandHandler<StartRecordingCommand> {
  private readonly logger = new Logger(StartRecordingHandler.name);

  constructor(
    @Inject(IAudioRecorder)
    private readonly audioRecorder: IAudioRecorder,
  ) {}

  async execute(command: StartRecordingCommand): Promise<void> {
    const lifelogPath = join(homedir(), LIFELOG_DIR);

    if (!existsSync(lifelogPath)) {
      this.logger.error(`Lifelog directory not found: ${lifelogPath}`);
      this.logger.error('Please run "lifelog setup" first to create the directory and install dependencies.');
      return;
    }

    const options: RecordingOptions = {
      sessionName: command.options.sessionName ?? RECORDING_DEFAULTS.sessionName,
      outputPath: lifelogPath,
      gain: command.options.gain ?? RECORDING_DEFAULTS.gain,
      rate: command.options.rate ?? RECORDING_DEFAULTS.rate,
      channels: command.options.channels ?? RECORDING_DEFAULTS.channels,
      threshold: command.options.threshold ?? RECORDING_DEFAULTS.threshold,
      recorderType: command.options.recorderType ?? RECORDING_DEFAULTS.recorderType,
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
