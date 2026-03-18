import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranscriptAudioHandler } from './handlers/transcript-audio.handler';
import { CategorizeTranscriptionHandler } from './handlers/categorize-transcription.handler';

@Module({
  imports: [CqrsModule],
  providers: [
    // Command Handlers
    TranscriptAudioHandler,
    CategorizeTranscriptionHandler,
  ],
})
export class ProcessingModule {}
