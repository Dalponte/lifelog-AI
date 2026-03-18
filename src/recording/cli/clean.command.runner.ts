import { Command, CommandRunner, Option } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { CleanCommand } from '../commands/clean.command';

@Command({
  name: 'clean',
  description: 'Delete all files in the ~/.lifelog directory',
})
export class CleanCommandRunner extends CommandRunner {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(
    passedParam: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    await this.commandBus.execute(
      new CleanCommand({ force: options?.force }),
    );
  }

  @Option({
    flags: '-f, --force',
    description: 'Skip confirmation prompt and delete immediately',
  })
  parseForce(): boolean {
    return true;
  }
}
