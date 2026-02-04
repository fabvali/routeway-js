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
export interface StreamingDelta {
    role?: "assistant";
    content?: string | null;
    reasoning_content?: string | null;
    tool_calls?: null;
}
export interface CompletionChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        delta: StreamingDelta;
        finish_reason?: string | null;
    }[];
    system_fingerprint?: string | null;
    usage?: null;
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
export interface StreamCallbacks {
    onChunk?: (chunk: CompletionChunk) => void;
    onContent?: (content: string) => void;
    onReasoning?: (reasoning: string) => void;
    onError?: (error: Error) => void;
    onDone?: () => void;
}
type NonStreamingOptions = Omit<CreateCompletionOptions, 'stream'> & {
    stream?: false | undefined;
};
type StreamingOptions = CreateCompletionOptions & {
    stream: true;
};
declare class Completions {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(apiKey: string, baseUrl: string);
    create(options: NonStreamingOptions): Promise<CompletionResponse>;
    create(options: StreamingOptions, callbacks: StreamCallbacks): Promise<void>;
    private handleStreamingResponse;
    private processLine;
    createIterator(options: StreamingOptions): AsyncGenerator<CompletionChunk, void, unknown>;
}
declare class Chat {
    readonly completions: Completions;
    constructor(apiKey: string, baseUrl: string);
}
export declare class Client {
    private readonly apiKey;
    private readonly baseUrl;
    readonly chat: Chat;
    constructor(apiKey: string, baseUrl?: string);
    models(): Promise<ModelResponse>;
}
export {};
