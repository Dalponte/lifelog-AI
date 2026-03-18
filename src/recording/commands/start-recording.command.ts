import { RecordingOptions } from '../interfaces/audio-recorder.interface';

export class StartRecordingCommand {
  constructor(public readonly options: Partial<RecordingOptions>) {}
}
