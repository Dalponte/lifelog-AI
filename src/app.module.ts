import { Module } from '@nestjs/common';
import { RecordingModule } from './recording/recording.module';
import { ProcessingModule } from './processing/processing.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, RecordingModule, ProcessingModule],
})
export class AppModule {}
