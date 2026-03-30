import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Updated to gemini-2.0-flash-lite based on diagnostic scan of this specific API key.
    // This resolves the 404 Not Found error for gemini-pro/1.5-flash.
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    console.log('[GEMINI] ✓ SYSTEM_READY: Flash-Lite brain online (v2.0).');
} else {
    console.error('[CRITICAL] GEMINI_API_KEY is not set. All AI features will be locked.');
}

export const geminiService = {
    async generateStudyOutline(context: string): Promise<string> {
        if (!model) throw new Error('Gemini API is not configured. Set GEMINI_API_KEY.');

        const prompt = `
        You are an expert study tutor. Create a comprehensive study outline based STRICTLY on the following content.
        
        Format the output in clean Markdown:
        - Use ## for main sections
        - Use bullet points for details
        - Bold **key terms**
        
        Content to analyze:
        "${context.substring(0, 15000)}" 
        (Truncated if too long)
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Outline Error:', error);
            throw new Error('Failed to generate outline from Gemini API.');
        }
    },

    async chat(history: { role: string, parts: string }[], newMessage: string): Promise<string> {
        if (!model) throw new Error('Gemini API is not configured. Set GEMINI_API_KEY.');

        try {
            // Convert frontend "user"/"ai" roles to Gemini's "user"/"model"
            const geminiHistory = history.map(h => ({
                role: h.role === 'ai' ? 'model' : 'user',
                parts: [{ text: h.parts }]
            }));

            // FIX: Gemini requires history to start with a "user" role.
            // Drop leading "model" entries to prevent API errors.
            while (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
                geminiHistory.shift();
            }

            const chat = model.startChat({ history: geminiHistory });

            const result = await chat.sendMessage(newMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Chat Error:', error);
            throw new Error('Failed to get response from Gemini API.');
        }
    },

    async generateStream(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
        if (!model) throw new Error('Gemini API is not configured.');
        try {
            const result = await model.generateContentStream(prompt);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                onChunk(chunkText);
            }
        } catch (error) {
            console.error('Gemini Stream Error:', error);
            throw new Error('Failed to generate stream from Gemini API.');
        }
    },

    async chatStream(history: { role: string, parts: string }[], newMessage: string, onChunk: (chunk: string) => void): Promise<void> {
        if (!model) throw new Error('Gemini API is not configured.');

        try {
            const geminiHistory = history.map(h => ({
                role: h.role === 'ai' ? 'model' : 'user',
                parts: [{ text: h.parts }]
            }));
            while (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') geminiHistory.shift();

            const chat = model.startChat({ history: geminiHistory });
            const result = await chat.sendMessageStream(newMessage);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                onChunk(chunkText);
            }
        } catch (error) {
            console.error('Gemini Stream Error:', error);
            throw new Error('Failed to stream response from Gemini API.');
        }
    }
};
