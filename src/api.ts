import { buildPrompt } from "./prompt.js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free models available on OpenRouter
const FREE_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
];

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

export async function generateCommand(
  query: string,
  shell: string = "zsh",
  apiKey?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY required. Get a free key at https://openrouter.ai/keys\n" +
      "Then run: export OPENROUTER_API_KEY='your-key-here'"
    );
  }

  const { system, user } = buildPrompt(query, shell);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      "HTTP-Referer": "https://github.com/terminalai/terminalai",
      "X-Title": "terminalai",
    },
    body: JSON.stringify({
      model: FREE_MODELS[0],
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message}`);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from AI model");
  }

  // Clean up the response - remove any markdown formatting or extra whitespace
  let command = data.choices[0].message.content.trim();

  // Remove markdown code blocks if present
  command = command.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");

  // Remove any leading/trailing quotes
  command = command.replace(/^["']|["']$/g, "");

  return command.trim();
}
