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
            const contextText = chunks
                .map((c, i) => {
                    if (c.content.includes('[VISUAL_CONTEXT_METADATA]')) {
                        return `--- [VISUAL_METADATA] ---\n${c.content}`;
                    }
                    return `--- [AUDIO_SEGMENT_${i+1}] ---\n${c.content}`;
                })
                .join('\n\n');

            const augmentedPrompt = `
SYSTEM ROLE: You are a high-fidelity Multimodal Video Content Analyst.
Your output must be professional, structured, and formatted for a Terminal CLI interface using Markdown.

CONTEXT DATA FROM VIDEO:
---------------------
${contextText}
---------------------

INSTRUCTIONS & CONSTRAINTS:
1. USE MARKDOWN: Use headers (###), bold (**), and lists (-) for deep structure.
2. CATEGORIZE: If the data allows, separate your answer into logical sections:
   - ### 🔍 EXECUTIVE SUMMARY
   - ### 📊 KEY_INSIGHTS
   - ### 👁️ VISUAL_ANALYSIS (If visual metadata is relevant)
3. BE CONCISE: Avoid generic greetings. Dive straight into the data.
4. If asked to summarize, use a bulleted list for maximum readability.
5. If the answer is absolutely not present, state: "SOURCE_ERROR: Data insufficient for current query."

USER QUERY: ${question}

SYSTEM_REPORT_v2.1:`;

            // 3. Generate the answer
            console.log(`[RAG] Generating structured answer...`);
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
                answer: "### ✗ SYSTEM_FAULT\nThe AI pipeline encountered a processing fault. Target video source might be unreachable.",
                sources: []
            };
        }
    }
};
