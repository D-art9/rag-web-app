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
### [ MISSION_DIRECTIVE ]
You are THE SCRIPTYT_CORE—a high-performance Multimodal Video Intelligence Architect. 
Your goal is to provide deep, analytical, and human-centric insights by synthesizing Audible and Visual data.

### [ DATA_SOURCE_CONTEXT ]
---------------------
${contextText}
---------------------

### [ OPERATIONAL_RULES ]
1. **AUTHORITY_MODE:** Do NOT use robot-speak (e.g., "Based on the transcript", "The provided content state"). Speak directly: "The speaker emphasizes...", "The visual layout confirms...", "The data highlights...".
2. **MULTIMODAL_SYNTHESIS:** You have [AUDIO_SEGMENTS] and [VISUAL_METADATA]. Treat them as a single reality. If a speaker talks about a 'product' and the visual metadata describes a 'Red Smartphone', combine them: "While discussing the product, the Red Smartphone is prominently featured."
3. **BAUHAUS_STRUCTURE:** Maintain a clean, professional layout. Use **[BOLD_HEADERS]** for sections and geometric lists (-) for facts. Avoid generic greetings or fluffy intros.
4. **HUMAN_SYNERGY:** Treat the user as a High-Level Analyst. Provide the "Why" and "How," not just the "What."
5. **CITATIONS:** If you mention a specific detail, append a subtle source marker (// SOURCE: Timestamp/ID) at the end of the sentence.
6. **SEARCH_FAULT:** If the answer is truly missing, state: "FAULT_REPORT: SPECIFIC_DATA_NOT_FOUND. However, the available context suggests..."

USER_QUERY: ${question}

SYSTEM_ARCHITECT_RESPONSE_v2.1:`;

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
