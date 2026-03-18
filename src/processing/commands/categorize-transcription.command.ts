export class CategorizeTranscriptionCommand {
  constructor(
    public readonly transcriptText: string,
    public readonly originalFileName: string,
  ) {}
}
