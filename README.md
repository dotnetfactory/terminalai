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
npm install -g terminalai

# Get a free API key from OpenRouter (takes 30 seconds)
# https://openrouter.ai/keys
export OPENROUTER_API_KEY="your-key-here"

# Set up shell integration
terminalai setup
```

Or try it without installing:

```bash
export OPENROUTER_API_KEY="your-key-here"
npx terminalai "find all jpg files"
```

## Usage

After running `terminalai setup`, use the `ai` command:

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

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | **Required.** Free API key from OpenRouter |
| `TERMINALAI_SHELL` | Override detected shell (zsh, bash, fish) |

### API Key

Get a free API key from [OpenRouter](https://openrouter.ai/keys) (takes 30 seconds):

```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export OPENROUTER_API_KEY="your-key-here"
```

The free tier is sufficient for personal use. OpenRouter offers free access to models like Llama and Mistral.

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

## License

MIT
