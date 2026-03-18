# Antigravity Agent Guidelines

This file serves as the explicit local context configuration when the AI Agent interacts with this project.

1. **Package Manager**: Use `yarn` as the default dependency manager.
2. **Git Policy**: Do NOT bother with Git commands in general. Exclusively focus on designing and implementing the technical solution.
3. **Architecture Context**: This application is a NestJS CLI globally accessible via NPM commands. It strictly uses the CQRS pattern via `@nestjs/cqrs`. Follow standard Hexagonal principles (separation of concerns, robust domains) when suggesting or building features.
