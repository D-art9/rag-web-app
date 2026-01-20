// This file defines TypeScript types and interfaces used throughout the frontend. 

export interface ChatMessage {
    id: string;
    user: string;
    content: string;
    timestamp: Date;
}

export interface DocumentUpload {
    id: string;
    url: string;
    title: string;
    uploadedAt: Date;
}

export interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    url: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}