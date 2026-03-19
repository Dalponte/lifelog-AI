export interface TranscriptionMetadata {
  filename: string;
  session: string;
  datetime: string;
  transcript?: string;
  category?: string;
  topics?: string;
  summary?: string;
  context?: string;
  improvedText?: string;
}

export abstract class IDatabaseRepository {
  abstract initDb(): void;
  abstract isProcessed(filename: string): boolean;
  abstract insertTranscription(metadata: TranscriptionMetadata): void;
  abstract updateTranscription(filename: string, transcript: string): void;
  abstract updateTranscriptionMetadata(filename: string, metadata: Partial<TranscriptionMetadata>): void;
  abstract getTranscription(filename: string): TranscriptionMetadata | undefined;
  abstract getTranscriptions(): TranscriptionMetadata[];
}
