import axios from 'axios';
import { llmConfig } from '../config/llm';

export const llmService = {
    /**
     * Low-level method to generate a response from the LLM provider.
     * Operates as a thin client for the OpenAI/API endpoint.
     */
    async generateResponse(prompt: string): Promise<string> {
        try {
            console.log('[LLM] ========== PROMPT TO GROQ ==========');
            console.log(prompt.substring(0, 800) + (prompt.length > 800 ? '...' : ''));
            console.log('[LLM] ========================================');

            const response: any = await axios.post(llmConfig.endpoint, {
                model: llmConfig.model,
                messages: [{ role: 'user', content: prompt }], // GPT-3.5-Turbo expects messages
                max_tokens: llmConfig.maxTokens,
                temperature: llmConfig.temperature,
            }, {
                headers: {
                    'Authorization': `Bearer ${llmConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // Supporting standard OpenAI chat completion structure
            const answer = response.data.choices?.[0]?.message?.content ||
                response.data.generated_text ||
                response.data.text ||
                '';

            console.log('[LLM] ========== GROQ RESPONSE ==========');
            console.log(answer);
            console.log('[LLM] ========================================');

            return answer;
        } catch (error: any) {
            const details = JSON.stringify(error.response?.data || error.message);
            console.error('[LLM] ✗ Error from Groq:', details);
            throw new Error(`LLM Error: ${details}`);
        }
    },
};