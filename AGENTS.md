# AGENTS.md

## Project Overview

Herdkit is a PHP monorepo management CLI tool built with TypeScript, running on Bun. It uses Ink (React-based terminal UI) for rendering and Commander for command parsing.

## Commands

```bash
bun run dev              # Run CLI in development mode
bun run build            # Compile to standalone binary at dist/herdkit
bun run typecheck        # TypeScript type checking (tsc --noEmit)
bun test                 # Run all tests (Bun's built-in test runner)
bun test src/modules/workspace  # Run tests for a specific module
bun test --watch         # Watch mode
```

## Tech Stack

- **Runtime**: Bun (package manager, bundler, test runner, runtime)
- **Language**: TypeScript (strict mode, ESNext, bundler module resolution)
- **CLI Framework**: Commander (command parsing) + Ink/React (terminal UI)
- **Testing**: Bun's built-in test runner (`bun:test`)

## Architecture

The codebase follows **vertical slice architecture** with ports & adapters for infrastructure boundaries.

### Directory Structure

```
src/
  cli.tsx                    # Entry point — wires Commander commands to module handlers
  modules/                   # Feature modules (vertical slices)
    <module>/
      commands/              # CLI command handlers (thin — delegate to services)
      services/              # Business logic
      models/                # Domain types and interfaces
      __tests__/             # Co-located tests
      index.ts               # Public API barrel export
  kernel/                    # Shared infrastructure (ports & adapters)
    filesystem/              # File system abstraction
    process/                 # Child process execution
    config/                  # Configuration loading (herdkit.json / composer.json)
    errors.ts                # Shared error types
  ui/                        # Shared Ink components
```

### Key Principles

1. **Modules are vertical slices**: Each module owns its commands, services, models, and tests. Modules communicate through explicit imports of each other's public API (`index.ts`), never reaching into internal files.

2. **Kernel provides infrastructure ports**: The `kernel/` directory defines interfaces (ports) for external dependencies (filesystem, process execution, git). Concrete implementations (adapters) live alongside the port. Services depend on port interfaces, never on concrete implementations directly — this enables testing with in-memory fakes.

3. **Commands are thin**: CLI command handlers in `commands/` parse arguments, call a service, and render output via Ink. No business logic lives in command handlers.

4. **Dependency direction**: `modules → kernel` (never kernel → modules, never circular between modules). If two modules need shared logic, extract it to `kernel/` or create a new shared module.

5. **Testing strategy**: Unit-test services using fake kernel adapters. Integration-test commands against real filesystem fixtures in `__tests__/fixtures/`. Use `describe`/`test`/`expect` from `bun:test`.

### Adding a New Feature

1. Create a module directory under `src/modules/<feature>/`
2. For simple modules, all files can be co-located in the module directory
3. For more complex modules, create structured subdirectories under `src/modules/<feature>/`
    1. Define domain types in `models/`
    2. Implement business logic in `services/`, accepting kernel ports via constructor/function params
    3. Create command handler in `commands/` that wires services to CLI
    4. Register the command in `src/cli.tsx`
    5. Export public API from `index.ts`
4. Add tests in `__tests__/`

### Conventions

- Use named exports exclusively (no default exports)
- Prefer function parameters over class constructors for dependency injection — keep it simple
- Error handling: throw typed errors from `kernel/errors.ts`; command handlers catch and render user-friendly output
- File naming: snake_case for files, PascalCase for types/components, camelCase for functions/variables
- Ink components go in `src/ui/` if shared, or inline in command handlers if single-use
- `Interface` for contracts/ports, `type` for data shapes
- For commit messages we are using the gitmoji convention
