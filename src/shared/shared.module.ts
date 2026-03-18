import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { AiService } from './ai/ai.service';

@Global()
@Module({
  providers: [DatabaseService, AiService],
  exports: [DatabaseService, AiService],
})
export class SharedModule {}
