import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StartRecordingHandler } from './handlers/start-recording.handler';
import { SetupHandler } from './handlers/setup.handler';
import { StartRecordingCommandRunner } from './cli/start-recording.command.runner';
import { SetupCommandRunner } from './cli/setup.command.runner';
import { IAudioRecorder } from './interfaces';
import { ISystemSetup } from './interfaces';
import { SoxRecorderService } from './infrastructure/sox-recorder.service';
import { LinuxSystemSetupService } from './infrastructure/linux-system-setup.service';

@Module({
  imports: [CqrsModule],
  providers: [
    // CQRS Handlers
    StartRecordingHandler,
    SetupHandler,

    // CLI Command Runners
    StartRecordingCommandRunner,
    SetupCommandRunner,

    // Infrastructure adapters (ports → adapters)
    {
      provide: IAudioRecorder,
      useClass: SoxRecorderService,
    },
    {
      provide: ISystemSetup,
      useClass: LinuxSystemSetupService,
    },
  ],
})
export class RecordingModule {}
