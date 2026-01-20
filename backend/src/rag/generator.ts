import { llmService } from '../services/llmService';

/**
 * Handles pure LLM generation logic.
 * Does NOT know about retrieval or RAG orchestration.
 */
export const generator = {
    generate: async (prompt: string): Promise<string> => {
        // Delegates to a low-level LLM client (llmService)
        const response = await llmService.generateResponse(prompt);
        return response;
    }
};