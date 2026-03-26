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
            // 1. Retrieve relevant chunks (Search increased to 10 in documentService)
            const chunks = await retriever.retrieve(question, contextId);

            if (chunks.length === 0) {
                console.log(`[RAG] No context found for query. Returning fallback.`);
                return {
                    answer: RAGConfig.fallbackMessage || "No context found for that query.",
                    sources: []
                };
            }

            const topScore = chunks[0].score;
            console.log(`[RAG] Top chunks for: "${question}" (Top score: ${topScore.toFixed(3)})`);

            // 2. Build the augmented prompt
            // We format the segments clearly so the AI can distinguish between them
            const contextText = chunks
                .map((c, i) => `--- [VIDEO_SEGMENT_${i+1}] ---\n${c.content}`)
                .join('\n\n');

            const augmentedPrompt = `
SYSTEM ROLE: You are an expert Video Content Analyst.
TASK: Analyze the provided transcript segments and answer the user's question accurately.

CONTEXT DATA FROM VIDEO:
---------------------
${contextText}
---------------------

INSTRUCTIONS:
1. Use ONLY the data above. No prior knowledge.
2. The transcript may be messy or unpunctuated. Use logic to reconstruct the speaker's intent.
3. If asked to "summarize" or "analyse", give a structured breakdown of the most informative segments.
4. If the context is completely irrelevant to the question, state: "Source data is insufficient for this specific query."

USER QUESTION: ${question}

DETAILED RESPONSE:`;

            // 3. Generate the answer
            console.log(`[RAG] Generating answer via GROQ/LLM...`);
            const answer = await generator.generate(augmentedPrompt);

            // 4. Extract sources (deduplicated)
            const citations: string[] = [];
            const seen = new Set<string>();
            
            for (const chunk of chunks) {
                const label = chunk.metadata?.title || chunk.metadata?.url || 'Source Document';
                if (!seen.has(label)) {
                    seen.add(label);
                    citations.push(label);
                }
            }

            return {
                answer,
                sources: citations
            };

        } catch (error) {
            console.error('RAG Pipeline Error:', error);
            return {
                answer: "System Error: The AI pipeline encountered a processing fault. Target video source might be unreachable.",
                sources: []
            };
        }
    }
};
