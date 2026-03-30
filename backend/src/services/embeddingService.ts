import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let embeddingModel: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Using the state-of-the-art embedding model for highest speed/accuracy.
    embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
}

export const embeddingService = {
    /**
     * High-speed vectorization via Google's Cloud TPUs.
     * Replaces local @xenova CPU-intensive embedding.
     */
    async embedText(text: string): Promise<number[]> {
        if (!embeddingModel) throw new Error('GEMINI_API_KEY not set for embeddings.');

        try {
            // Clean the text to prevent API errors on special characters
            const cleanText = text.replace(/\n/g, ' ').substring(0, 8000); // 8k token limit safety
            
            const result = await embeddingModel.embedContent(cleanText);
            const embedding = result.embedding;
            
            return embedding.values;
        } catch (error: any) {
            console.error('[VECTOR_ERROR] API Embedding Failed:', error.message);
            throw new Error(`Cloud Vectorization Fault: ${error.message}`);
        }
    },

    /**
     * Batch embedding for massive speed gains during ingestion.
     */
    async embedBatch(texts: string[]): Promise<number[][]> {
        if (!embeddingModel) throw new Error('GEMINI_API_KEY not set for batch embeddings.');

        try {
            // Processing in small batches to respect the API limits
            const BATCH_SIZE = 10;
            const allEmbeddings: number[][] = [];

            for (let i = 0; i < texts.length; i += BATCH_SIZE) {
                const batch = texts.slice(i, i + BATCH_SIZE).map(t => t.substring(0, 8000));
                
                const result = await embeddingModel.batchEmbedContents({
                    requests: batch.map((text) => ({
                        content: { role: 'user', parts: [{ text }] },
                    })),
                });

                allEmbeddings.push(...result.embeddings.map((e: any) => e.values));
            }

            return allEmbeddings;
        } catch (error: any) {
            console.error('[VECTOR_ERROR] Batch Embedding Failed:', error.message);
            throw new Error(`Cloud Batch Vectorization Fault: ${error.message}`);
        }
    }
};
