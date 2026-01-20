import { Request, Response } from 'express';
import { ragPipeline } from '../../rag/pipeline';

export const chatController = {
    /**
     * Handles incoming chat messages by delegating to the RAG pipeline.
     * Preserves existing API contract (request body: { message }, response: { reply }).
     */
    sendMessage: async (req: Request, res: Response) => {
        try {
            const { message, videoId } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            console.log(`[CHAT] Received message: "${message}" for videoId: ${videoId || 'ALL'}`);

            // Delegate to the central RAG pipeline with optional videoId filter
            const result = await ragPipeline.process(message, videoId);

            res.status(200).json({
                answer: result.answer,
                sources: result.sources // Including sources for transparency
            });
        } catch (error: any) {
            console.error('Chat Controller Error:', error);
            res.status(500).json({
                message: 'Error processing chat message',
                error: error.message
            });
        }
    },

    getChatHistory: async (req: Request, res: Response) => {
        try {
            // Placeholder for chat history retrieval from DB
            res.status(200).json({ history: [] });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error retrieving chat history',
                error: error.message
            });
        }
    }
};