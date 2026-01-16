# terminalai - AI command generator for Fish
# Add this to your ~/.config/fish/config.fish or source this file

function ai
  if test (count $argv) -eq 0
    terminalai --help
    return 0
  end
  # Pass through subcommands directly (not captured)
  switch $argv[1]
    case model setup --help -h
      terminalai $argv
      return $status
  end
  set cmd (terminalai $argv)
  if test -n "$cmd"
    # Pre-fill the command line - user can edit and press Enter to execute
    commandline -r "$cmd"
  end
end
