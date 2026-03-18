import { Command, CommandRunner } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { SetupCommand } from '../commands/setup.command';

@Command({
  name: 'setup',
  description: 'Install dependencies (SoX) and create the ~/.lifelog directory',
})
export class SetupCommandRunner extends CommandRunner {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(): Promise<void> {
    await this.commandBus.execute(new SetupCommand());
  }
}
