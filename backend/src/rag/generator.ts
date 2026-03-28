import { geminiService } from '../services/geminiService';

/**
 * Handles pure LLM generation logic.
 * Switched to Gemini 1.5 Flash for Multimodal RAG synthesis.
 */
export const generator = {
    /**
     * Non-streaming method for basic RAG requests.
     */
    generate: async (prompt: string): Promise<string> => {
        // Delegates to Geminiservice chat for consistency (no history)
        return await geminiService.chat([], prompt);
    },

    /**
     * High-performance stream generator for "Flowy" UI responses.
     */
    generateStream: async (prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
        return await geminiService.generateStream(prompt, onChunk);
    }
};