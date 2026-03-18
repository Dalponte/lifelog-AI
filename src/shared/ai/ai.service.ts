import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Type, Schema } from '@google/genai';

export interface ProcessedTranscription {
  category: string;
  topics: string[];
  summary: string;
  context: string;
  improvedText: string;
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. AiService will fail when called. Please set it in your .env file.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async categorizeAndRestructure(transcript: string): Promise<ProcessedTranscription> {
    this.logger.log('Sending transcript to Gemini for categorization and restructuring...');
    
    const prompt = `You are an expert technical writer and data analyzer.
You will receive a raw, spoken-word audio transcription. It might be rambling, lack punctuation, or contain filler words. It could be in English or Portuguese.

Your task is to:
1. Determine the main category of the audio note.
2. Extract specific topics covered.
3. Write a 1-2 sentence summary.
4. Explain the underlying intent or background context of the thoughts.
5. Create an improved, highly coherent, grammatically corrected Markdown version of the raw transcription, preserving the original language and core meaning but removing filler and structuring it well.

Raw Transcription:
"""
${transcript}
"""`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'The main category of the audio note',
              },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'An array of specific topics covered',
              },
              summary: {
                type: Type.STRING,
                description: 'A 1-2 sentence summary of the recording',
              },
              context: {
                type: Type.STRING,
                description: 'The underlying intent or background context of the thoughts',
              },
              improvedText: {
                type: Type.STRING,
                description: 'The restructured, grammatically corrected, and highly coherent Markdown version of the raw transcription',
              },
            },
            required: ['category', 'topics', 'summary', 'context', 'improvedText'],
          },
        },
      });

      if (!response.text) {
        throw new Error('Gemini API returned an empty text response.');
      }

      // The response is guaranteed to be a JSON string that matches the schema
      const result = JSON.parse(response.text) as ProcessedTranscription;
      return result;
      
    } catch (error) {
      this.logger.error(`Failed to process transcript with Gemini: ${error.message}`);
      throw error;
    }
  }
}
