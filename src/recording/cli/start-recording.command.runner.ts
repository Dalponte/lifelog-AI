import { Command, CommandRunner, Option } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { StartRecordingCommand } from '../commands/start-recording.command';

@Command({ name: 'start', description: 'Start an audio recording session' })
export class StartRecordingCommandRunner extends CommandRunner {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(
    passedParam: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const sessionName = options?.session || passedParam[0];

    await this.commandBus.execute(
      new StartRecordingCommand({
        sessionName,
        gain: options?.gain,
        rate: options?.rate ? parseInt(options.rate, 10) : undefined,
        channels: options?.channels ? parseInt(options.channels, 10) : undefined,
        threshold: options?.threshold,
        recorderType: options?.recorder,
      }),
    );
  }

  @Option({
    flags: '-s, --session [name]',
    description: 'Session name for the recording (e.g., "meeting", "notes")',
  })
  parseSession(val: string): string {
    return val;
  }

  @Option({
    flags: '-g, --gain [dB]',
    description: 'Volume gain in dB (default: 0, range: -12 to +12)',
  })
  parseGain(val: string): string {
    return val;
  }

  @Option({
    flags: '-r, --rate [hz]',
    description: 'Sample rate in Hz (default: 16000)',
  })
  parseRate(val: string): string {
    return val;
  }

  @Option({
    flags: '-c, --channels [n]',
    description: 'Number of channels: 1=mono, 2=stereo (default: 1)',
  })
  parseChannels(val: string): string {
    return val;
  }

  @Option({
    flags: '-t, --threshold [pct]',
    description: 'Silence threshold percentage (default: 1%)',
  })
  parseThreshold(val: string): string {
    return val;
  }

  @Option({
    flags: '--recorder [type]',
    description: 'Recorder backend: sox | node-record-lpcm16 (default: sox)',
  })
  parseRecorder(val: string): string {
    return val;
  }
}
