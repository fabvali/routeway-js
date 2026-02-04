"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Completions {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }
    async create(options, callbacks) {
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
            throw new Error(`Failed to fetch completion (${response.status}): ${errorText}`);
        }
        if (options.stream) {
            if (!response.body) {
                throw new Error("No response body for streaming");
            }
            if (!callbacks) {
                throw new Error("Callbacks are required for streaming");
            }
            await this.handleStreamingResponse(response.body, callbacks);
            return;
        }
        return response.json();
    }
    async handleStreamingResponse(body, callbacks) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                    await this.processLine(line.trim(), callbacks);
                }
            }
            if (buffer.trim()) {
                await this.processLine(buffer.trim(), callbacks);
            }
            callbacks.onDone?.();
        }
        catch (error) {
            callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
        finally {
            reader.releaseLock();
        }
    }
    async processLine(line, callbacks) {
        if (!line || line.startsWith(":"))
            return;
        if (!line.startsWith("data: "))
            return;
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
            return;
        }
        try {
            const chunk = JSON.parse(data);
            callbacks.onChunk?.(chunk);
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
                callbacks.onContent?.(delta.content);
            }
            if (delta?.reasoning_content) {
                callbacks.onReasoning?.(delta.reasoning_content);
            }
        }
        catch (error) {
            console.warn("Failed to parse chunk:", line);
        }
    }
    async *createIterator(options) {
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
            throw new Error(`Failed to fetch completion (${response.status}): ${errorText}`);
        }
        if (!response.body) {
            throw new Error("No response body for streaming");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith(":") || !trimmed.startsWith("data: "))
                        continue;
                    const data = trimmed.slice(6).trim();
                    if (data === "[DONE]")
                        return;
                    try {
                        const chunk = JSON.parse(data);
                        yield chunk;
                    }
                    catch {
                    }
                }
            }
            if (buffer.trim()) {
                const trimmed = buffer.trim();
                if (trimmed.startsWith("data: ")) {
                    const data = trimmed.slice(6).trim();
                    if (data !== "[DONE]") {
                        try {
                            const chunk = JSON.parse(data);
                            yield chunk;
                        }
                        catch {
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
class Chat {
    constructor(apiKey, baseUrl) {
        this.completions = new Completions(apiKey, baseUrl);
    }
}
class Client {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl ?? "https://api.routeway.ai";
        this.chat = new Chat(this.apiKey, this.baseUrl);
    }
    async models() {
        const endpoint = "v1/models";
        const url = `${this.baseUrl}/${endpoint}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch models (${response.status}): ${errorText}`);
        }
        return response.json();
    }
}
exports.Client = Client;
