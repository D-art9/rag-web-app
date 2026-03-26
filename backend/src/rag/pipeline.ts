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
            // Separating Visual Context from Audio Segments
            const contextText = chunks
                .map((c, i) => {
                    if (c.content.includes('[VISUAL_CONTEXT_METADATA]')) {
                        return `--- [VISUAL_METADATA] ---\n${c.content}`;
                    }
                    return `--- [AUDIO_SEGMENT_${i+1}] ---\n${c.content}`;
                })
                .join('\n\n');

            const augmentedPrompt = `
SYSTEM ROLE: You are an expert Multimodal Video Content Analyst.
TASK: Analyze the provided segments (Visual Metadata & Audio Transcript) and answer accurately.

CONTEXT DATA FROM VIDEO:
---------------------
${contextText}
---------------------

INSTRUCTIONS & CONSTRAINTS:
1. [VISUAL_METADATA]: This is what is SEEN on the screen/thumbnail (branding, text overlays, appearance).
2. [AUDIO_SEGMENT]: This is what is SAID (transcript). Use logic to handle messy transcripts.
3. If the user asks about visual details (e.g., 'What was the thumbnail?', 'What is he wearing?'), use the VISUAL_METADATA.
4. If asked to summarize, synthesize BOTH what is heard and what is seen.
5. If the answer is absolutely not present, state: "Source data is insufficient for this specific query."
6. Do NOT fabricate or use prior knowledge.

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
