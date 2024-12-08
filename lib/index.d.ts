interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
interface CompletionResponse {
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
        logprobs: string;
        finish_reason: string;
    }[];
}
interface Model {
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
interface ModelResponse {
    object: string;
    data: Model[];
}
declare class Completions {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(apiKey: string, baseUrl: string);
    create(messages: ChatMessage[], model?: string): Promise<CompletionResponse>;
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
