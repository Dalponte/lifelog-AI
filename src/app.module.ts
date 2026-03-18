import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecordingModule } from './recording/recording.module';
import { ProcessingModule } from './processing/processing.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    RecordingModule,
    ProcessingModule,
  ],
})
export class AppModule {}
