export interface ProcessedTranscription {
  category: string;
  topics: string[];
  summary: string;
  context: string;
  improvedText: string;
}

export abstract class IAiService {
  abstract categorizeAndRestructure(transcript: string): Promise<ProcessedTranscription>;
}
