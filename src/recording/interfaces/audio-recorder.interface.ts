export interface RecordingOptions {
  sessionName?: string;
  outputPath: string;
  gain: string;
  rate: number;
  channels: number;
  threshold: string;
  recorderType: 'sox' | 'node-record-lpcm16';
}

export interface IAudioRecorder {
  start(options: RecordingOptions): Promise<void>;
  stop(): Promise<void>;
}

export const IAudioRecorder = Symbol('IAudioRecorder');
