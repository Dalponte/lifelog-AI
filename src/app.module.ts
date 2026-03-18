import { Module } from '@nestjs/common';
import { RecordingModule } from './recording/recording.module';

@Module({
  imports: [RecordingModule],
})
export class AppModule {}
