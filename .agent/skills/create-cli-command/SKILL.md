---
name: create-cli-command
description: How to create a new CLI command in the lifelog NestJS CLI project, following Hexagonal Architecture and CQRS patterns.
---

# Create a CLI Command

This skill describes how to add a new CLI command to the **lifelog** project — a NestJS CLI application built with `nest-commander` and `@nestjs/cqrs`.

## Architecture Overview

The project follows **Hexagonal Architecture** (Ports & Adapters) combined with **CQRS**. Every CLI command flows through these layers:

```
CLI Runner (nest-commander) → CQRS Command → Handler → Port (interface) → Adapter (infrastructure)
```

### Directory Structure

Commands live inside a **module** folder (e.g. `src/recording/`). Each module follows this layout:

```
src/<module>/
├── cli/                        # CLI layer — nest-commander runners
│   └── <name>.command.runner.ts
├── commands/                   # CQRS command DTOs
│   └── <name>.command.ts
├── handlers/                   # CQRS command handlers (use cases)
│   └── <name>.handler.ts
├── interfaces/                 # Ports — abstract contracts
│   ├── <name>.interface.ts
│   └── index.ts                # Barrel re-exports
├── infrastructure/             # Adapters — concrete implementations
│   └── <name>.service.ts
├── domain/                     # Domain constants, value objects, entities
│   └── <name>-defaults.ts
└── <module>.module.ts          # NestJS module wiring
```

---

## Step-by-step Guide

Use the **`setup`** command (simple, no options) and **`start`** command (complex, with options) as canonical references. The steps below use a fictional `status` command as an example.

### Step 1: Create the CQRS Command DTO

**File:** `src/<module>/commands/<name>.command.ts`

This is a plain class that carries data from the CLI layer into the handler. It has **no logic** — just a data container.

**Simple command (no parameters):**

```typescript
// src/recording/commands/status.command.ts
export class StatusCommand {}
```

**Command with parameters:**

```typescript
// src/recording/commands/status.command.ts
export class StatusCommand {
  constructor(public readonly options: { verbose?: boolean }) {}
}
```

> **Reference:** `src/recording/commands/setup.command.ts` (no params), `src/recording/commands/start-recording.command.ts` (with params)

---

### Step 2: Create the Port (Interface)

**File:** `src/<module>/interfaces/<name>.interface.ts`

Define the **abstract contract** (port) that the handler depends on. The handler never imports infrastructure directly.

```typescript
// src/recording/interfaces/recording-status.interface.ts

export interface RecordingStatus {
  isRecording: boolean;
  activeSession?: string;
  recordingDuration?: number;
}

export interface IRecordingStatusChecker {
  getStatus(): Promise<RecordingStatus>;
}

// Symbol token for DI — MUST match the interface name
export const IRecordingStatusChecker = Symbol('IRecordingStatusChecker');
```

**Important patterns:**
- Export both the **interface** and a **Symbol constant** with the same name. The symbol is used as the NestJS injection token.
- Export any related DTOs/types from the same file.

Then re-export from the barrel file:

```typescript
// src/recording/interfaces/index.ts
export { IRecordingStatusChecker } from './recording-status.interface';
export type { RecordingStatus } from './recording-status.interface';
```

> **Reference:** `src/recording/interfaces/system-setup.interface.ts`, `src/recording/interfaces/audio-recorder.interface.ts`

---

### Step 3: Create the Adapter (Infrastructure Service)

**File:** `src/<module>/infrastructure/<name>.service.ts`

Implement the port. This is the **only place** where external I/O (file system, processes, network) should happen.

```typescript
// src/recording/infrastructure/recording-status.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  IRecordingStatusChecker,
  RecordingStatus,
} from '../interfaces/recording-status.interface';

@Injectable()
export class RecordingStatusService implements IRecordingStatusChecker {
  private readonly logger = new Logger(RecordingStatusService.name);

  async getStatus(): Promise<RecordingStatus> {
    // concrete implementation using file system, processes, etc.
    return { isRecording: false };
  }
}
```

**Key rules:**
- Always decorate with `@Injectable()`.
- Always `implements` the port interface.
- Use `Logger` from `@nestjs/common` for all logging.

> **Reference:** `src/recording/infrastructure/linux-system-setup.service.ts`, `src/recording/infrastructure/sox-recorder.service.ts`

---

### Step 4: Create the CQRS Handler

**File:** `src/<module>/handlers/<name>.handler.ts`

This is the **use case / application logic**. It receives the CQRS command and orchestrates the work using injected ports.

```typescript
// src/recording/handlers/status.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { StatusCommand } from '../commands/status.command';
import { IRecordingStatusChecker } from '../interfaces/recording-status.interface';

@CommandHandler(StatusCommand)
export class StatusHandler implements ICommandHandler<StatusCommand> {
  private readonly logger = new Logger(StatusHandler.name);

  constructor(
    @Inject(IRecordingStatusChecker)
    private readonly statusChecker: IRecordingStatusChecker,
  ) {}

  async execute(_command: StatusCommand): Promise<void> {
    this.logger.log('Checking recording status...');
    const status = await this.statusChecker.getStatus();

    if (status.isRecording) {
      console.log(`🔴 Recording in progress: ${status.activeSession}`);
    } else {
      console.log('⚪ No active recording.');
    }
  }
}
```

**Key rules:**
- Decorate with `@CommandHandler(CommandClass)`.
- Implement `ICommandHandler<CommandClass>`.
- Inject ports using `@Inject(SymbolToken)`, **never** import infrastructure classes directly.
- Use `console.log` for user-facing output, `this.logger` for internal logs.

> **Reference:** `src/recording/handlers/setup.handler.ts`, `src/recording/handlers/start-recording.handler.ts`

---

### Step 5: Create the CLI Command Runner

**File:** `src/<module>/cli/<name>.command.runner.ts`

This is the `nest-commander` entry point — it parses CLI arguments/options and dispatches the CQRS command via `CommandBus`.

**Simple command (no options):**

```typescript
// src/recording/cli/status.command.runner.ts
import { Command, CommandRunner } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { StatusCommand } from '../commands/status.command';

@Command({
  name: 'status',
  description: 'Show the current recording status',
})
export class StatusCommandRunner extends CommandRunner {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(): Promise<void> {
    await this.commandBus.execute(new StatusCommand());
  }
}
```

**Command with options:**

```typescript
// src/recording/cli/status.command.runner.ts
import { Command, CommandRunner, Option } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { StatusCommand } from '../commands/status.command';

@Command({
  name: 'status',
  description: 'Show the current recording status',
})
export class StatusCommandRunner extends CommandRunner {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(
    passedParam: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    await this.commandBus.execute(
      new StatusCommand({ verbose: options?.verbose }),
    );
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Show detailed status information',
  })
  parseVerbose(): boolean {
    return true;
  }
}
```

**Key rules:**
- The `name` in `@Command()` becomes the CLI subcommand: `lifelog <name>`.
- The runner's **only** job is to parse CLI input and dispatch a CQRS command. **No business logic here.**
- Use `@Option()` decorator for each CLI flag.

> **Reference:** `src/recording/cli/setup.command.runner.ts` (simple), `src/recording/cli/start-recording.command.runner.ts` (with options)

---

### Step 6: Register in the Module

**File:** `src/<module>/<module>.module.ts`

Wire everything together in the NestJS module. Register handlers, CLI runners, and port→adapter bindings.

```typescript
// src/recording/recording.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Existing imports...
import { StatusHandler } from './handlers/status.handler';
import { StatusCommandRunner } from './cli/status.command.runner';
import { IRecordingStatusChecker } from './interfaces';
import { RecordingStatusService } from './infrastructure/recording-status.service';

@Module({
  imports: [CqrsModule],
  providers: [
    // CQRS Handlers
    StatusHandler,

    // CLI Command Runners
    StatusCommandRunner,

    // Infrastructure adapters (ports → adapters)
    {
      provide: IRecordingStatusChecker,      // ← the Symbol token
      useClass: RecordingStatusService,       // ← the concrete class
    },
  ],
})
export class RecordingModule {}
```

**Key rules:**
- `CqrsModule` must be imported.
- Handlers and CLI runners go directly in `providers`.
- Port bindings use `{ provide: Symbol, useClass: ConcreteClass }`.

> **Reference:** `src/recording/recording.module.ts`

---

### Step 7: (If new module) Register in AppModule

If the command belongs to a **new module** (not an existing one like `recording`), register it in `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { NewFeatureModule } from './new-feature/new-feature.module';

@Module({
  imports: [NewFeatureModule],
})
export class AppModule {}
```

> **Reference:** `src/app.module.ts`

---

## Checklist

When creating a new CLI command, verify:

- [ ] **CQRS Command** class created in `commands/`
- [ ] **Port interface** + Symbol token created in `interfaces/`
- [ ] **Barrel file** (`interfaces/index.ts`) updated with re-exports
- [ ] **Adapter service** created in `infrastructure/`, implements the port
- [ ] **Handler** created in `handlers/`, injects port via Symbol, decorated with `@CommandHandler`
- [ ] **CLI Runner** created in `cli/`, dispatches CQRS command via `CommandBus`
- [ ] **Module** updated — handler, runner, and port→adapter binding registered
- [ ] Handler does **NOT** import infrastructure directly (Hexagonal Architecture)
- [ ] CLI Runner has **NO** business logic (CQRS)
- [ ] Build passes: `yarn build`
- [ ] Command runs: `node dist/main.js <command-name>`

## Quick Reference — Naming Conventions

| Layer | File naming | Class naming |
|---|---|---|
| CQRS Command | `<name>.command.ts` | `<Name>Command` |
| Handler | `<name>.handler.ts` | `<Name>Handler` |
| Port (interface) | `<name>.interface.ts` | `I<Name>` + Symbol |
| Adapter | `<name>.service.ts` | `<Name>Service` |
| CLI Runner | `<name>.command.runner.ts` | `<Name>CommandRunner` |
| Module | `<module>.module.ts` | `<Module>Module` |
