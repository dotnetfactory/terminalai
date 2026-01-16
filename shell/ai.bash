# terminalai - AI command generator for Bash
# Add this to your ~/.bashrc or source this file

function ai() {
  if [[ -z "$*" ]]; then
    terminalai --help
    return 0
  fi
  # Pass through subcommands directly (not captured)
  case "$1" in
    model|setup|--help|-h)
      terminalai "$@"
      return $?
      ;;
  esac
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
