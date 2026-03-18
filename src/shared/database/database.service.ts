import { Injectable, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LIFELOG_DIR = '.lifelog';
const DB_NAME = 'lifelog.db';

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

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private db: Database.Database;

  constructor() {
    this.connect();
  }

  private connect(): void {
    const lifelogPath = join(homedir(), LIFELOG_DIR);
    if (!existsSync(lifelogPath)) {
      mkdirSync(lifelogPath, { recursive: true });
    }
    const dbPath = join(lifelogPath, DB_NAME);
    this.db = new Database(dbPath);
  }

  public initDb(): void {
    this.logger.log('Initializing SQLite database...');
    const stmt = this.db.prepare(`
      CREATE TABLE IF NOT EXISTS transcriptions (
        filename TEXT PRIMARY KEY,
        session TEXT,
        datetime TEXT,
        transcript TEXT,
        category TEXT,
        topics TEXT,
        summary TEXT,
        context TEXT,
        improvedText TEXT
      )
    `);
    stmt.run();
    
    // Attempt to add new columns to existing table if they don't exist (basic migration)
    const columns = ['category', 'topics', 'summary', 'context', 'improvedText'];
    for (const col of columns) {
      try {
        this.db.prepare(`ALTER TABLE transcriptions ADD COLUMN ${col} TEXT`).run();
        this.logger.log(`Added column ${col} to transcriptions table.`);
      } catch (e) {
        // Column probably already exists
      }
    }
    
    this.logger.log('Database transcriptions table is ready.');
  }

  public isProcessed(filename: string): boolean {
    const stmt = this.db.prepare('SELECT filename FROM transcriptions WHERE filename = ?');
    const result = stmt.get(filename);
    return !!result;
  }

  public insertTranscription(metadata: TranscriptionMetadata): void {
    const stmt = this.db.prepare(`
      INSERT INTO transcriptions (filename, session, datetime)
      VALUES (@filename, @session, @datetime)
    `);
    stmt.run(metadata);
  }

  public updateTranscript(filename: string, transcript: string): void {
    const stmt = this.db.prepare('UPDATE transcriptions SET transcript = ? WHERE filename = ?');
    stmt.run(transcript, filename);
  }

  public updateTranscriptionMetadata(filename: string, metadata: Partial<TranscriptionMetadata>): void {
    const fields = Object.keys(metadata).filter(k => k !== 'filename' && k !== 'session' && k !== 'datetime');
    if (fields.length === 0) return;

    const setClause = fields.map(k => `${k} = @${k}`).join(', ');
    const stmt = this.db.prepare(`UPDATE transcriptions SET ${setClause} WHERE filename = @filename`);
    
    stmt.run({ ...metadata, filename });
  }

  public getTranscription(filename: string): TranscriptionMetadata | undefined {
    const stmt = this.db.prepare('SELECT * FROM transcriptions WHERE filename = ?');
    return stmt.get(filename) as TranscriptionMetadata | undefined;
  }

  public getTranscriptions(): TranscriptionMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM transcriptions ORDER BY datetime DESC');
    const results = stmt.all() as TranscriptionMetadata[];
    return results.map(row => ({
      ...row,
      transcript: row.transcript && row.transcript.length > 100 
        ? row.transcript.substring(0, 100) + '...' 
        : row.transcript
    }));
  }
}
