# terminalai - AI command generator for Fish
# Add this to your ~/.config/fish/config.fish or source this file

function ai
  if test (count $argv) -eq 0
    echo "Usage: ai <natural language query>"
    echo "Example: ai find all jpg files"
    return 1
  end
  set cmd (terminalai $argv)
  if test -n "$cmd"
    # Pre-fill the command line - user can edit and press Enter to execute
    commandline -r "$cmd"
  end
end
