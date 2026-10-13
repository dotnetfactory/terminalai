import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";

const CONFIG_DIR = path.join(os.homedir(), ".config", "terminalai");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// Recommended free models
export const FREE_MODELS = [
  { id: "mistralai/devstral-2512:free", name: "Devstral (coding-focused)" },
  { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1 (reasoning)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (general)" },
];

export const DEFAULT_MODEL = FREE_MODELS[0].id;

interface Config {
  apiKey?: string;
  model?: string;
  apiUrl?: string;
}

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors, return empty config
  }
  return {};
}

export function saveConfig(config: Config): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(): string | undefined {
  // Environment variable takes precedence
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }
  // Fall back to config file
  const config = loadConfig();
  return config.apiKey;
}

export function saveApiKey(apiKey: string): void {
  const config = loadConfig();
  config.apiKey = apiKey;
  saveConfig(config);
}

export function getModel(): string | undefined {
  // Environment variable takes precedence
  if (process.env.TERMINALAI_MODEL) {
    return process.env.TERMINALAI_MODEL;
  }
  // Fall back to config file
  const config = loadConfig();
  return config.model;
}

export function saveModel(model: string): void {
  const config = loadConfig();
  config.model = model;
  saveConfig(config);
}

export const DEFAULT_API_URL_BASE = "https://openrouter.ai/api/v1";

export function getApiUrl(): string {
  if (process.env.OPENAI_API_URL) {
    return process.env.OPENAI_API_URL;
  }
  const config = loadConfig();
  if (config.apiUrl) {
    return config.apiUrl;
  }
  return DEFAULT_API_URL_BASE;
}

export function saveApiUrl(url: string): void {
  const config = loadConfig();
  config.apiUrl = url;
  saveConfig(config);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptForApiKey(): Promise<string | undefined> {
  console.log("\nNo API key found. You can get a free OpenRouter API key to use terminalai.");
  console.log("Get one at: https://openrouter.ai/keys (takes 30 seconds)\n");

  const apiKey = await prompt("Enter your API key (leave blank to skip): ");

  if (apiKey.trim()) {
    saveApiKey(apiKey.trim());
    console.log("\nAPI key saved to ~/.config/terminalai/config.json\n");
    return apiKey.trim();
  }

  console.log("\nNo API key saved (left blank).\n");
  return undefined;
}

export async function promptForApiUrl(): Promise<string> {
  console.log("\nAPI endpoint (OpenAI-compatible). Default: OpenRouter");
  console.log(`Press Enter to use default: ${DEFAULT_API_URL_BASE}\n`);
  const url = await prompt("Enter API endpoint URL (optional): ");
  if (url.trim()) {
    saveApiUrl(url.trim());
    console.log("\nAPI endpoint saved.\n");
    return url.trim();
  }
  console.log("\nUsing default endpoint.\n");
  return DEFAULT_API_URL_BASE;
}

export async function promptForModel(): Promise<string> {
  console.log("\nSelect a model:\n");

  FREE_MODELS.forEach((model, index) => {
    const marker = index === 0 ? " (recommended)" : "";
    console.log(`  ${index + 1}. ${model.name}${marker}`);
    console.log(`     ${model.id}\n`);
  });
  console.log(`  4. Enter custom model ID\n`);

  const answer = await prompt("Choose (1-4): ");
  const choice = parseInt(answer, 10);

  let model: string;

  if (choice >= 1 && choice <= 3) {
    model = FREE_MODELS[choice - 1].id;
  } else if (choice === 4) {
    console.log("\nFind model IDs at: https://openrouter.ai/models\n");
    model = await prompt("Enter model ID: ");
    if (!model) {
      console.error("No model provided. Using default.");
      model = DEFAULT_MODEL;
    }
  } else {
    console.log("Invalid choice. Using default model.");
    model = DEFAULT_MODEL;
  }

  saveModel(model);
  console.log(`\nModel saved: ${model}\n`);

  return model;
}

export function showModelHelp(): void {
  console.error("\nTo change the model, run:");
  console.error("  ai model\n");
  console.error("Or set a custom model:");
  console.error("  ai model <model-id>\n");
  console.error("Find available models at:");
  console.error("  https://openrouter.ai/models\n");
}
