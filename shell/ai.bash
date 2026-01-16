# terminalai - AI command generator for Bash
# Add this to your ~/.bashrc or source this file

function ai() {
  if [[ -z "$*" ]]; then
    echo "Usage: ai <natural language query>"
    echo "Example: ai find all jpg files"
    return 1
  fi
  local cmd
  cmd=$(terminalai "$*")
  if [[ -n "$cmd" ]]; then
    # Add to history for easy access with up arrow
    history -s "$cmd"
    # Print the command
    echo "$cmd"
    echo "Command added to history. Press Up arrow or copy to execute."
  fi
}
