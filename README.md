# terminalai

AI-powered terminal command generator. Type natural language, get shell commands.

```bash
$ ai find all jpg files larger than 1mb
find . -name "*.jpg" -size +1M
```

## Features

- **Natural language to shell commands** - Just describe what you want
- **Pre-fills your command line** - Review and edit before executing
- **Free to use** - Uses free AI models via OpenRouter (free API key required)
- **Multi-shell support** - Zsh, Bash, and Fish

## Installation

```bash
# Install globally
npm install -g terminalai-app

# Set up shell integration (creates the 'ai' command)
terminalai setup

# Restart your terminal or run: source ~/.zshrc
```

On first run, you'll be prompted for a free API key from [OpenRouter](https://openrouter.ai/keys). The key is saved to `~/.config/terminalai/config.json`.

Or try it without installing:

```bash
npx terminalai "find all jpg files"
```

## Usage

After setup, use the `ai` command:

```bash
# Find files
ai find all python files modified today

# System info
ai show disk usage by folder

# Git operations
ai show commits from last week

# Text processing
ai count lines in all js files

# Network
ai show what is using port 3000
```

The generated command appears in your terminal ready to execute. Press Enter to run it, or edit it first.

## How It Works

1. You type `ai <your request>`
2. terminalai sends your request to a free AI model via OpenRouter
3. The AI generates the appropriate shell command
4. The command is pre-filled in your terminal
5. You review, optionally edit, and press Enter to execute

## Configuration

### API Key

On first run, terminalai will prompt you for an API key and save it automatically.

Get a free key from [OpenRouter](https://openrouter.ai/keys) (takes 30 seconds). The free tier is sufficient for personal use.

### Model Selection

On first run, you'll be prompted to select a model. You can change it anytime:

```bash
# Interactive model selection
ai model

# Set a specific model directly
ai model anthropic/claude-sonnet-4
```

**Available free models:**
- `mistralai/devstral-2512:free` - Coding-focused (recommended)
- `deepseek/deepseek-r1-0528:free` - Strong reasoning
- `meta-llama/llama-3.3-70b-instruct:free` - General purpose

Browse all models at: https://openrouter.ai/models

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Override saved API key |
| `TERMINALAI_MODEL` | Override saved model |
| `TERMINALAI_SHELL` | Override detected shell (zsh, bash, fish) |

Config is stored at: `~/.config/terminalai/config.json`

## Shell Support

| Shell | Pre-fill Support | Notes |
|-------|------------------|-------|
| Zsh | Full | Uses `print -z` |
| Fish | Full | Uses `commandline -r` |
| Bash | Partial | Adds to history, prints command |

## Manual Shell Setup

If you prefer to set up manually, add one of these to your shell config:

**Zsh** (`~/.zshrc`):
```zsh
function ai() {
  local cmd=$(terminalai "$*")
  [[ -n "$cmd" ]] && print -z "$cmd"
}
```

**Fish** (`~/.config/fish/config.fish`):
```fish
function ai
  set cmd (terminalai $argv)
  test -n "$cmd" && commandline -r "$cmd"
end
```

**Bash** (`~/.bashrc`):
```bash
function ai() {
  local cmd=$(terminalai "$*")
  [[ -n "$cmd" ]] && history -s "$cmd" && echo "$cmd"
}
```

## Safety

- Commands are **never auto-executed** - you always review first
- The AI avoids destructive commands by default
- You can edit any generated command before running

## Author

Developed by [Emad Ibrahim](https://x.com/eibrahim)

## License

MIT
