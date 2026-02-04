import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../../services/geminiService';

export const studyController = {
    generateOutline: async (req: Request, res: Response, next: NextFunction) => {
        console.log("Received generateOutline request. Body:", JSON.stringify(req.body).substring(0, 200) + "...");
        try {
            const { context } = req.body;
            if (!context) {
                console.error("Error: Context is missing");
                return res.status(400).json({ error: 'Context is required' });
            }

            console.log("Context found, calling Gemini Service...");
            const outline = await geminiService.generateStudyOutline(context);
            console.log("Gemini response received (length):", outline.length);
            res.json({ outline });
        } catch (error) {
            console.error("studyController Error:", error);
            next(error);
        }
    },

    chat: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { history, message } = req.body;
            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const response = await geminiService.chat(history || [], message);
            res.json({ answer: response });
        } catch (error) {
            next(error);
        }
    }
};
