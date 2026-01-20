import { retriever } from './retriever';
import { generator } from './generator';
import { RAGConfig } from '../config/rag';
import { RAGResponse } from '../types/index';

/**
 * Orchestrates the RAG flow: Retrieval -> Augmentation -> Generation.
 * This is the ONLY place where retrieval and generation are combined.
 */
export const ragPipeline = {
    process: async (question: string, contextId?: string): Promise<RAGResponse> => {
        try {
            // 1. Retrieve relevant chunks
            const chunks = await retriever.retrieve(question, contextId);

            // 2. Confidence Check
            // If no chunks are found or the top score is too low, return a fallback.
            const topScore = chunks.length > 0 ? chunks[0].score : 0;

            console.log(`[RAG] Top ${Math.min(3, chunks.length)} chunks for query: "${question}"`);
            chunks.slice(0, 3).forEach((chunk, idx) => {
                console.log(`[RAG]   ${idx + 1}. Score: ${chunk.score.toFixed(3)} | Content: "${chunk.content.substring(0, 100)}..."`);
            });

            if (chunks.length === 0 || topScore < RAGConfig.confidenceThreshold) {
                console.log(`[RAG] Low confidence (score: ${topScore}). Returning fallback.`);
                return {
                    answer: RAGConfig.fallbackMessage,
                    sources: [] // Citations are omitted for fallbacks
                };
            }

            console.log(`[RAG] ✓ Confidence acceptable (score: ${topScore.toFixed(3)}). Generating answer...`);

            // 3. Build the augmented prompt
            const contextText = chunks.map(c => c.content).join('\n\n');
            const augmentedPrompt = `
Context information is below.
---------------------
${contextText}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: ${question}
Answer:`;

            // 4. Generate the answer
            const answer = await generator.generate(augmentedPrompt);

            // 5. Build citations
            // Mapping retrieved chunks to their text content only
            const citations = chunks.map(c => c.content);

            return {
                answer,
                sources: citations
            };
        } catch (error: any) {
            console.error('RAG Pipeline Error:', error);
            // Pass through specific LLM errors for better user feedback
            if (error.message.includes('LLM Error') || error.message.includes('API Key')) {
                throw error;
            }
            throw new Error('RAG Pipeline failed to process request');
        }
    }
};
