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
import { SoxRecorderService } from './infrastructure/sox-recorder.service';
import { LinuxSystemSetupService } from './infrastructure/linux-system-setup.service';
import { FileCleanerService } from './infrastructure/file-cleaner.service';

@Module({
  imports: [CqrsModule],
  providers: [
    // CQRS Handlers
    StartRecordingHandler,
    SetupHandler,
    CleanHandler,

    // CLI Command Runners
    StartRecordingCommandRunner,
    SetupCommandRunner,
    CleanCommandRunner,

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
