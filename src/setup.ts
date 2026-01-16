import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";

const SHELL_CONFIGS: Record<string, { file: string; code: string }> = {
  zsh: {
    file: ".zshrc",
    code: `
# terminalai - AI command generator
function ai() {
  if [[ -z "$*" ]]; then
    echo "Usage: ai <natural language query>"
    echo "Example: ai find all jpg files"
    return 1
  fi
  local cmd
  cmd=$(terminalai "$*")
  if [[ -n "$cmd" ]]; then
    print -z "$cmd"
  fi
}
`,
  },
  bash: {
    file: ".bashrc",
    code: `
# terminalai - AI command generator
function ai() {
  if [[ -z "$*" ]]; then
    echo "Usage: ai <natural language query>"
    echo "Example: ai find all jpg files"
    return 1
  fi
  local cmd
  cmd=$(terminalai "$*")
  if [[ -n "$cmd" ]]; then
    # Add to history and print for manual copy
    history -s "$cmd"
    echo "$cmd"
    echo "Command added to history. Press Up arrow or copy to execute."
  fi
}
`,
  },
  fish: {
    file: ".config/fish/config.fish",
    code: `
# terminalai - AI command generator
function ai
  if test (count $argv) -eq 0
    echo "Usage: ai <natural language query>"
    echo "Example: ai find all jpg files"
    return 1
  end
  set cmd (terminalai $argv)
  if test -n "$cmd"
    commandline -r "$cmd"
  end
end
`,
  },
};

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function detectShell(): string {
  const shell = process.env.SHELL || "";
  if (shell.includes("zsh")) return "zsh";
  if (shell.includes("bash")) return "bash";
  if (shell.includes("fish")) return "fish";
  return "zsh"; // default
}

function getConfigPath(shell: string): string {
  const home = os.homedir();
  const config = SHELL_CONFIGS[shell];
  if (!config) {
    throw new Error(`Unsupported shell: ${shell}`);
  }
  return path.join(home, config.file);
}

function isAlreadyInstalled(configPath: string): boolean {
  if (!fs.existsSync(configPath)) {
    return false;
  }
  const content = fs.readFileSync(configPath, "utf-8");
  return content.includes("terminalai");
}

async function installForShell(shell: string): Promise<boolean> {
  const config = SHELL_CONFIGS[shell];
  if (!config) {
    console.log(`  Unsupported shell: ${shell}`);
    return false;
  }

  const configPath = getConfigPath(shell);

  if (isAlreadyInstalled(configPath)) {
    console.log(`  Already installed in ${configPath}`);
    return true;
  }

  // Ensure directory exists for fish
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Append the shell function
  fs.appendFileSync(configPath, config.code);
  console.log(`  Added to ${configPath}`);
  return true;
}

export async function runSetup(): Promise<void> {
  console.log("\nterminalai setup\n");
  console.log("This will add the 'ai' command to your shell configuration.\n");

  const detectedShell = detectShell();
  console.log(`Detected shell: ${detectedShell}\n`);

  const answer = await prompt("Install for all supported shells? (Y/n): ");

  const shells = answer === "n" ? [detectedShell] : ["zsh", "bash", "fish"];

  console.log("\nInstalling...\n");

  for (const shell of shells) {
    console.log(`${shell}:`);
    await installForShell(shell);
  }

  console.log("\nSetup complete!\n");
  console.log("To start using terminalai, either:");
  console.log("  1. Open a new terminal window, or");
  console.log(`  2. Run: source ~/${SHELL_CONFIGS[detectedShell].file}\n`);
  console.log("Then try: ai find all jpg files\n");
}
