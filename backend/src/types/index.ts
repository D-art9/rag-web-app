export interface LLMConfig {
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
    endpoint: string;
}

export interface Document {
    id: string;
    url: string;
    transcript: string;
    metadata?: any;
}

export interface VectorDBConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    database: string;
}

export interface Transcript {
    content: string;
    text?: string;
    wordCount?: number;
}

export interface Embedding {
    id: string;
    vector: number[];
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface RAGResponse {
    answer: string;
    sources: string[];
}