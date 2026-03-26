import { retriever } from './retriever';
import { generator } from './generator';
import { RAGConfig } from '../config/rag';
import { RAGResponse } from '../types/index';

/**
 * Orchestrates the RAG flow: Retrieval -> Augmentation -> Generation.
 */
export const ragPipeline = {
    process: async (question: string, contextId?: string): Promise<RAGResponse> => {
        try {
            // 1. Retrieve relevant chunks
            const chunks = await retriever.retrieve(question, contextId);

            const topScore = chunks.length > 0 ? chunks[0].score : 0;

            console.log(`[RAG] Top ${Math.min(3, chunks.length)} chunks for query: "${question}"`);
            chunks.slice(0, 3).forEach((chunk, idx) => {
                console.log(`[RAG]   ${idx + 1}. Score: ${chunk.score.toFixed(3)} | Content: "${chunk.content.substring(0, 100)}..."`);
            });

            if (chunks.length === 0 || topScore < RAGConfig.confidenceThreshold) {
                console.log(`[RAG] Low confidence (score: ${topScore}). Returning fallback.`);
                return {
                    answer: RAGConfig.fallbackMessage,
                    sources: []
                };
            }

            console.log(`[RAG] ✓ Confidence acceptable (score: ${topScore.toFixed(3)}). Generating answer...`);

            // 2. Build the augmented prompt
            const contextText = chunks.map(c => c.content).join('\n\n');
            const augmentedPrompt = `You are a helpful assistant. Use ONLY the context provided below to answer the user's question. Do not use prior knowledge or make assumptions beyond what is stated in the context.

Context:
---------------------
${contextText}
---------------------

User Question: ${question}

Instructions:
- If the answer is found in the context, respond clearly and concisely.
- If the answer is NOT found in the context, say: "I don't have enough information in the provided context to answer that question."
- Do not fabricate or infer information beyond what is explicitly stated.

Answer:`;

            // 3. Generate the answer
            const answer = await generator.generate(augmentedPrompt);

            // FIX: Sources are now deduplicated video titles + URLs, not raw text blobs
            const seen = new Set<string>();
            const citations: string[] = [];
            for (const chunk of chunks) {
                const label = chunk.metadata?.title || chunk.metadata?.url || 'Source';
                if (!seen.has(label)) {
                    seen.add(label);
                    citations.push(label);
                }
            }

            return { answer, sources: citations };
        } catch (error: any) {
            console.error('RAG Pipeline Error:', error);
            if (error.message.includes('LLM Error') || error.message.includes('API Key')) {
                throw error;
            }
            throw new Error('RAG Pipeline failed to process request');
        }
    }
};
