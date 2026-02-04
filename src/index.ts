export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CreateCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: unknown;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    index: number;
    message: ChatMessage;
    logprobs: string | null;
    finish_reason: string;
  }[];
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  type: string;
  access: {
    Starter: boolean;
    Pro: boolean;
    Enterprise: boolean;
  };
}

export interface ModelResponse {
  object: string;
  data: Model[];
}

class Completions {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  public constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  public async create(
    options: CreateCompletionOptions
  ): Promise<CompletionResponse> {
    const endpoint = "v1/chat/completions";
    const url = `${this.baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch completion (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<CompletionResponse>;
  }
}

class Chat {
  public readonly completions: Completions;

  public constructor(apiKey: string, baseUrl: string) {
    this.completions = new Completions(apiKey, baseUrl);
  }
}

export class Client {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  public readonly chat: Chat;

  public constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl ?? "https://api.routeway.ai";
    this.chat = new Chat(this.apiKey, this.baseUrl);
  }

  public async models(): Promise<ModelResponse> {
    const endpoint = "v1/models";
    const url = `${this.baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch models (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<ModelResponse>;
  }
}
