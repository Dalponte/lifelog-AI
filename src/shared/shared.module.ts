import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { AiService } from './ai/ai.service';
import { IDatabaseRepository } from './database/interfaces/database-repository.interface';
import { IAiService } from './ai/interfaces/ai-service.interface';

@Global()
@Module({
  providers: [
    { provide: IDatabaseRepository, useClass: DatabaseService },
    { provide: IAiService, useClass: AiService }
  ],
  exports: [IDatabaseRepository, IAiService],
})
export class SharedModule {}
