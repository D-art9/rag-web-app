import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
} else {
    console.warn("WARN: GEMINI_API_KEY is not set. Study Chat features will fail.");
}

export const geminiService = {
    async generateStudyOutline(context: string): Promise<string> {
        if (!model) throw new Error("Gemini API not configured");

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
            console.error("Gemini Outline Error:", error);
            throw new Error("Failed to generate outline");
        }
    },

    async chat(history: { role: string, parts: string }[], newMessage: string): Promise<string> {
        if (!model) throw new Error("Gemini API not configured");

        try {
            // Convert "user"/"ai" to Gemini's "user"/"model"
            const geminiHistory = history.map(h => ({
                role: h.role === 'ai' ? 'model' : 'user',
                parts: [{ text: h.parts }]
            }));

            const chat = model.startChat({
                history: geminiHistory,
            });

            const result = await chat.sendMessage(newMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Chat Error:", error);
            throw new Error("Failed to get response from Gemini");
        }
    }
};
