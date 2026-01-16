import { buildPrompt } from "./prompt.js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export class ModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelError";
  }
}

const TIMEOUT_MS = 30000; // 30 second timeout

function createSpinner() {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stderr.write(`\r${frames[i]} Thinking...`);
    i = (i + 1) % frames.length;
  }, 80);

  return {
    stop: () => {
      clearInterval(interval);
      process.stderr.write("\r\x1b[K"); // Clear the line
    },
  };
}

export async function generateCommand(
  query: string,
  shell: string,
  apiKey: string,
  model: string
): Promise<string> {
  const { system, user } = buildPrompt(query, shell);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const spinner = createSpinner();

  let response: Response;
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/terminalai/terminalai",
        "X-Title": "terminalai",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    spinner.stop();
    if (err instanceof Error && err.name === "AbortError") {
      throw new ModelError(`Request timed out after ${TIMEOUT_MS / 1000}s. The model "${model}" may be slow or unavailable.`);
    }
    throw err;
  }
  clearTimeout(timeoutId);
  spinner.stop();

  if (!response.ok) {
    const errorText = await response.text();
    // Check if it's a model-related error
    if (
      response.status === 404 ||
      response.status === 400 ||
      errorText.includes("No endpoints found") ||
      errorText.includes("not enabled") ||
      errorText.includes("model")
    ) {
      throw new ModelError(`Model error (${model}): ${errorText}`);
    }
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (data.error) {
    throw new ModelError(`Model error: ${data.error.message}`);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from AI model");
  }

  // Clean up the response - remove any markdown formatting or extra whitespace
  let command = data.choices[0].message.content.trim();

  // Remove markdown code blocks if present
  command = command.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");

  // Only remove wrapping quotes if the entire command is wrapped in matching quotes
  if (
    (command.startsWith('"') && command.endsWith('"')) ||
    (command.startsWith("'") && command.endsWith("'"))
  ) {
    command = command.slice(1, -1);
  }

  return command.trim();
}
