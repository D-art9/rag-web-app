import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let visionModel: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Gemini 1.5 Flash is optimized for high-speed multimodal (Image/Video) reasoning
    visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export const visionService = {
    /**
     * Analyzes a YouTube thumbnail and returns a rich textual description.
     */
    async analyzeThumbnail(thumbnailUrl: string): Promise<string> {
        try {
            if (!API_KEY || !visionModel) {
                console.warn('[VISION_SERVICE] ✗ Skipping analysis: No API Key atau Vision Model initialization failed.');
                return '';
            }

            console.log(`[VISION_SERVICE] 👁️  Analyzing thumbnail: ${thumbnailUrl}`);

            // 1. Fetch the image as arraybuffer
            const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data as ArrayBuffer);

            // 2. Prepare the payload for Gemini Multimodal
            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: 'image/jpeg'
                }
            };

            const prompt = `Analyze this YouTube thumbnail carefully. 
            1. Extract ALL text overlays (headlines).
            2. Describe the main subject (person, object, logo).
            3. Note any branding or distinct visual styles (e.g., 'Google branding', 'MacBook on a desk').
            4. This data will be used for Search RAG. Give us a concise, high-density description.`;

            // 3. Generate content
            const result = await visionModel.generateContent([prompt, imagePart]);
            const textResponse = result.response.text();

            console.log(`[VISION_SERVICE] ✓ Intelligence extracted: ${textResponse.substring(0, 50)}...`);
            return textResponse;

        } catch (error: any) {
            console.error('[VISION_SERVICE] ✗ Failed to analyze image:', error.message);
            return 'Visual analysis unvailable for this source.';
        }
    }
};
