## Requirements

### Requirement: Config file existence check
The system SHALL check if a `herdkit.yaml` file already exists in the current working directory before proceeding with initialization.

#### Scenario: Config file already exists
- **WHEN** user runs `herdkit init` in a directory that already contains `herdkit.yaml`
- **THEN** system SHALL display a message informing the user that the config file already exists and SHALL NOT overwrite it

#### Scenario: Config file does not exist
- **WHEN** user runs `herdkit init` in a directory that does not contain `herdkit.yaml`
- **THEN** system SHALL proceed with the interactive initialization flow

### Requirement: Package path prompt
The system SHALL interactively ask the user to provide a path to a directory that holds packages.

#### Scenario: User provides a path
- **WHEN** system prompts for a package directory path
- **THEN** user SHALL be able to enter a relative directory path

#### Scenario: User provides no path
- **WHEN** system prompts for a package directory path and user submits an empty value
- **THEN** system SHALL set `monorepo.paths` to an empty array and proceed to write the config file

### Requirement: Existing directory handling
The system SHALL validate whether the user-provided path corresponds to an existing directory.

#### Scenario: Directory exists
- **WHEN** user provides a path that corresponds to an existing directory
- **THEN** system SHALL add that path to `monorepo.paths`

### Requirement: Non-existing directory handling
The system SHALL ask the user whether to create a directory when the provided path does not exist.

#### Scenario: User confirms directory creation
- **WHEN** user provides a path to a non-existing directory and confirms they want to create it
- **THEN** system SHALL create the directory and add the path to `monorepo.paths`

#### Scenario: User declines directory creation
- **WHEN** user provides a path to a non-existing directory and declines creation
- **THEN** system SHALL NOT create the directory and SHALL set `monorepo.paths` to an empty array

### Requirement: Config file generation
The system SHALL write a `herdkit.yaml` file in the current working directory with the collected configuration.

#### Scenario: Config with package path
- **WHEN** initialization completes with a configured package path (e.g., `packages`)
- **THEN** system SHALL write `herdkit.yaml` with content:
  ```yaml
  monorepo:
    paths:
      - packages
  ```

#### Scenario: Config with empty paths
- **WHEN** initialization completes with no configured package paths
- **THEN** system SHALL write `herdkit.yaml` with content:
  ```yaml
  monorepo:
    paths: []
  ```

### Requirement: CLI command registration
The `init` command SHALL be registered as a subcommand of the `herdkit` CLI.

#### Scenario: Command is available
- **WHEN** user runs `herdkit init`
- **THEN** the init command handler SHALL execute

#### Scenario: Command appears in help
- **WHEN** user runs `herdkit --help`
- **THEN** the `init` command SHALL be listed with a description
