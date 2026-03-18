import { Injectable, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LIFELOG_DIR = '.lifelog';
const DB_NAME = 'lifelog.db';

export interface AudioMetadata {
  filename: string;
  session: string;
  datetime: string;
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
      CREATE TABLE IF NOT EXISTS audios (
        filename TEXT PRIMARY KEY,
        session TEXT,
        datetime TEXT
      )
    `);
    stmt.run();
    this.logger.log('Database audios table is ready.');
  }

  public isAudioProcessed(filename: string): boolean {
    const stmt = this.db.prepare('SELECT filename FROM audios WHERE filename = ?');
    const result = stmt.get(filename);
    return !!result;
  }

  public insertAudio(metadata: AudioMetadata): void {
    const stmt = this.db.prepare(`
      INSERT INTO audios (filename, session, datetime)
      VALUES (@filename, @session, @datetime)
    `);
    stmt.run(metadata);
  }

  public getProcessedAudios(): AudioMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM audios ORDER BY datetime DESC');
    return stmt.all() as AudioMetadata[];
  }
}
