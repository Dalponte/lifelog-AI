export abstract class IAudioTranscriber {
  abstract transcribe(filePath: string): Promise<{ transcriptText: string; stderr: string }>;
}
