import { RecordingOptions } from '../interfaces/audio-recorder.interface';

export const RECORDING_DEFAULTS: Omit<RecordingOptions, 'outputPath'> = {
  sessionName: undefined,
  gain: '0',
  rate: 16000,
  channels: 1,
  threshold: '1%',
  recorderType: 'sox',
};
