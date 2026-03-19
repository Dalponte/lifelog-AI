import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranscriptAudioHandler } from './handlers/transcript-audio.handler';
import { CategorizeTranscriptionHandler } from './handlers/categorize-transcription.handler';
import { WhisperTranscriberService } from './infrastructure/whisper-transcriber.service';
import { IAudioTranscriber } from './interfaces/audio-transcriber.interface';

@Module({
  imports: [CqrsModule],
  providers: [
    // Command Handlers
    TranscriptAudioHandler,
    CategorizeTranscriptionHandler,
    { provide: IAudioTranscriber, useClass: WhisperTranscriberService }
  ],
})
export class ProcessingModule {}
