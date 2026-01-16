#!/usr/bin/env node

import { generateCommand, ModelError } from "./api.js";
import { runSetup } from "./setup.js";
import {
  getApiKey,
  promptForApiKey,
  getModel,
  promptForModel,
  saveModel,
  showModelHelp,
  DEFAULT_MODEL,
  FREE_MODELS,
} from "./config.js";

async function handleModelCommand(args: string[]): Promise<void> {
  // terminalai model <model-id> - set directly
  if (args.length > 0) {
    const model = args.join(" ");
    saveModel(model);
    console.log(`Model set to: ${model}`);
    return;
  }

  // terminalai model - interactive selection
  const currentModel = getModel() || DEFAULT_MODEL;
  console.log(`\nCurrent model: ${currentModel}\n`);
  await promptForModel();
}

async function main() {
  const args = process.argv.slice(2);

  // Handle setup command
  if (args[0] === "setup") {
    await runSetup();
    return;
  }

  // Handle model command
  if (args[0] === "model") {
    await handleModelCommand(args.slice(1));
    return;
  }

  // Handle help
  if (args[0] === "--help" || args[0] === "-h" || args.length === 0) {
    const currentModel = getModel() || DEFAULT_MODEL;
    console.log(`
terminalai - AI-powered terminal command generator

Usage:
  ai <natural language query>    Generate a shell command
  ai setup                       Set up shell integration
  ai model                       Change AI model (interactive)
  ai model <model-id>            Set a specific model
  ai --help                      Show this help message

Examples:
  ai find all jpg files
  ai list files sorted by size
  ai show disk usage

Current model: ${currentModel}

Available free models:
${FREE_MODELS.map((m) => `  - ${m.id}`).join("\n")}

Environment variables:
  OPENROUTER_API_KEY    Override saved API key
  TERMINALAI_MODEL      Override saved model
  TERMINALAI_SHELL      Override detected shell (zsh, bash, fish)

Config file: ~/.config/terminalai/config.json
`);
    return;
  }

  // Get the query from arguments
  const query = args.join(" ");

  // Detect shell from environment or default to zsh
  const shell = process.env.TERMINALAI_SHELL || process.env.SHELL?.split("/").pop() || "zsh";

  // Get API key from env or config, prompt if not found
  let apiKey = getApiKey();
  if (!apiKey) {
    apiKey = await promptForApiKey();
  }

  // Get model from env or config, prompt if not found
  let model = getModel();
  if (!model) {
    model = await promptForModel();
  }

  try {
    const command = await generateCommand(query, shell, apiKey, model);
    // Output only the command - shell function will handle pre-filling
    console.log(command);
  } catch (error) {
    if (error instanceof ModelError) {
      console.error(`Error: ${error.message}`);
      showModelHelp();
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }
}

main();
