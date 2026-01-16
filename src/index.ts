#!/usr/bin/env node

import { generateCommand } from "./api.js";
import { runSetup } from "./setup.js";

async function main() {
  const args = process.argv.slice(2);

  // Handle setup command
  if (args[0] === "setup") {
    await runSetup();
    return;
  }

  // Handle help
  if (args[0] === "--help" || args[0] === "-h" || args.length === 0) {
    console.log(`
terminalai - AI-powered terminal command generator

Usage:
  terminalai <natural language query>    Generate a shell command
  terminalai setup                       Set up shell integration
  terminalai --help                      Show this help message

Examples:
  terminalai find all jpg files
  terminalai list files sorted by size
  terminalai show disk usage

Environment variables:
  OPENROUTER_API_KEY    Optional API key for higher rate limits
  TERMINALAI_SHELL      Override detected shell (zsh, bash, fish)
`);
    return;
  }

  // Get the query from arguments
  const query = args.join(" ");

  // Detect shell from environment or default to zsh
  const shell = process.env.TERMINALAI_SHELL || process.env.SHELL?.split("/").pop() || "zsh";

  // Get optional API key
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const command = await generateCommand(query, shell, apiKey);
    // Output only the command - shell function will handle pre-filling
    console.log(command);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }
}

main();
