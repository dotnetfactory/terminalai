# terminalai - AI command generator for Zsh
# Add this to your ~/.zshrc or source this file

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
    # Pre-fill the command line - user can edit and press Enter to execute
    print -z "$cmd"
  fi
}
