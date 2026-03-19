import { Injectable } from '@nestjs/common';
import { IRecordingConfig } from '../interfaces/recording-config.interface';
import { RecordingOptions } from '../interfaces/audio-recorder.interface';

@Injectable()
export class RecordingConfigService implements IRecordingConfig {
  getDefaults(): Omit<RecordingOptions, 'outputPath'> {
    return {
      sessionName: undefined,
      gain: '0',
      rate: 16000,
      channels: 1,
      threshold: '1%',
      recorderType: 'sox',
    };
  }
}
