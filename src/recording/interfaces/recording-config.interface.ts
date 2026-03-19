import { RecordingOptions } from './audio-recorder.interface';

export abstract class IRecordingConfig {
  abstract getDefaults(): Omit<RecordingOptions, 'outputPath'>;
}
