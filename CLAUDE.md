# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

terminalai is an AI-powered terminal command generator that converts natural language requests into shell commands. It uses free AI models via OpenRouter and provides shell integration for Zsh, Bash, and Fish.

## Development Commands

### Build
```bash
npm run build          # Compile TypeScript to JavaScript (tsc)
npm run dev            # Watch mode for development (tsc --watch)
npm start              # Run the compiled application
```

### Testing
Currently no test framework is configured. Manual testing can be done by:
1. Building the project: `npm run build`
2. Running the CLI directly: `node dist/index.js "your query"`
3. Or using npx: `npx terminalai "your query"`

### Setup
```bash
npm install            # Install dependencies
npm run build          # Build the project
terminalai setup       # Set up shell integration (adds 'ai' command)
```

## Project Structure

```
├── src/                 # Source TypeScript files
│   ├── index.ts         # Main entry point
│   ├── api.ts           # OpenRouter API communication
│   ├── config.ts        # Configuration management (API key, model)
│   ├── prompt.ts        # System prompt generation for AI
│   └── setup.ts         # Shell integration setup
├── shell/               # Shell function templates
├── docs/                # Documentation files
├── dist/                # Compiled JavaScript output (gitignored)
├── package.json         # Project metadata and scripts
└── tsconfig.json        # TypeScript configuration
```

## Key Files and Their Purposes

- **src/index.ts**: Main CLI entry point, handles command routing and execution flow
- **src/api.ts**: Handles communication with OpenRouter API, includes retry logic and error handling
- **src/config.ts**: Manages user configuration (API key, model selection) with environment variable fallback
- **src/prompt.ts**: Generates system prompts for the AI based on shell type
- **src/setup.ts**: Handles shell integration for Zsh, Bash, and Fish
- **package.json**: Defines dependencies, build scripts, and bin executable

## Architecture Notes

1. **Modular Design**: Separation of concerns between API handling, configuration, prompting, and shell integration
2. **Configuration Priority**: Environment variables > config file > defaults
3. **Shell Integration**: Adds `ai` function to user's shell config that pipes queries to the CLI and pre-fills the command line
4. **Error Handling**: Comprehensive error handling for API timeouts, model errors, and network issues
5. **Free Models**: Pre-configured with recommended free models from OpenRouter

## Common Tasks

### Adding New Features
1. Modify src/index.ts for new CLI commands or flags
2. Update src/api.ts for changes to API communication
3. Adjust src/prompt.ts for changes to how queries are sent to the AI
4. Update src/setup.ts if shell integration needs changes
5. Update README.md with documentation
6. Bump version in package.json and publish

### Model Management
- Interactive selection: `ai model`
- Direct setting: `ai model <model-id>`
- Environment override: `TERMINALAI_MODEL=<model-id> ai "query"`

### Configuration
- API key stored in ~/.config/terminalai/config.json
- Can be overridden with OPENROUTER_API_KEY environment variable
- Model preference stored in same config file

## Verification

To verify changes work correctly:
1. Build: `npm run build`
2. Test with sample queries: `node dist/index.js "find all js files"`
3. Check shell integration: `ai model` (should show current model)
4. Test end-to-end: `ai find all jpg files` (should pre-fill command in terminal)
