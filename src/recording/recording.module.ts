import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StartRecordingHandler } from './handlers/start-recording.handler';
import { SetupHandler } from './handlers/setup.handler';
import { CleanHandler } from './handlers/clean.handler';
import { StartRecordingCommandRunner } from './cli/start-recording.command.runner';
import { SetupCommandRunner } from './cli/setup.command.runner';
import { CleanCommandRunner } from './cli/clean.command.runner';
import { IAudioRecorder } from './interfaces';
import { ISystemSetup } from './interfaces';
import { IFileCleaner } from './interfaces';
import { FileCleanerService } from './infrastructure/file-cleaner.service';
import { ProcessHandler } from './handlers/process.handler';
import { ProcessCommandRunner } from './cli/process.command.runner';
import { ListProcessedHandler } from './handlers/list-processed.handler';
import { ListProcessedCommandRunner } from './cli/list-processed.command.runner';
import { SoxRecorderService } from './infrastructure/sox-recorder.service';
import { LinuxSystemSetupService } from './infrastructure/linux-system-setup.service';

@Module({
  imports: [CqrsModule],
  providers: [
    // CQRS Handlers
    StartRecordingHandler,
    SetupHandler,
    CleanHandler,
    ProcessHandler,
    ListProcessedHandler,

    // CLI Command Runners
    StartRecordingCommandRunner,
    SetupCommandRunner,
    CleanCommandRunner,
    ProcessCommandRunner,
    ListProcessedCommandRunner,

    // Infrastructure adapters (ports → adapters)
    {
      provide: IAudioRecorder,
      useClass: SoxRecorderService,
    },
    {
      provide: ISystemSetup,
      useClass: LinuxSystemSetupService,
    },
    {
      provide: IFileCleaner,
      useClass: FileCleanerService,
    },
  ],
})
export class RecordingModule {}
