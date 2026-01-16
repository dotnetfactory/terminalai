# terminalai - AI command generator for Zsh
# Add this to your ~/.zshrc or source this file

function ai() {
  if [[ -z "$*" ]]; then
    echo "Usage: ai <natural language query>"
    echo "Example: ai find all jpg files"
    return 1
  fi
  local cmd
  cmd=$(terminalai "$*")
  if [[ -n "$cmd" ]]; then
    # Pre-fill the command line - user can edit and press Enter to execute
    print -z "$cmd"
  fi
}
