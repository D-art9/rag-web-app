import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let visionModel: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export const visionService = {
    async analyzeThumbnail(thumbnailUrl: string): Promise<string> {
        try {
            if (!API_KEY || !visionModel) {
                console.warn('[PIPELINE_VISION] ✗ ERROR: GEMINI_API_KEY_UNSET');
                return '';
            }

            console.log(`[PIPELINE_VISION] 🛰️  INITIATING ANALYSIS: ${thumbnailUrl}`);

            // 1. Fetch the image
            console.log(`[PIPELINE_VISION] 📡 DOWNLOADING_IMAGE_BUFFER...`);
            const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data as ArrayBuffer);
            console.log(`[PIPELINE_VISION] ✓ BUFFER_READY: ${Math.round(imageBuffer.length / 1024)}kb`);

            // 2. Prepare payload
            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: 'image/jpeg'
                }
            };

            const prompt = `Analyze this YouTube thumbnail carefully. 
            1. Extract ALL text overlays (headlines).
            2. Describe the main subject (person, object, logo).
            3. Note any branding or distinct visual styles.
            THIS DATA IS FOR RAG SEARCH. BE HIGH-DENSITY.`;

            // 3. Contact Gemini
            console.log(`[PIPELINE_VISION] 🧠 CONSULTING_GEMINI_FLASH_v1.5...`);
            const result = await visionModel.generateContent([prompt, imagePart]);
            const textResponse = result.response.text();

            console.log(`[PIPELINE_VISION] 💎 INTELLIGENCE_EXTRACTED: "${textResponse.substring(0, 60)}..."`);
            return textResponse;

        } catch (error: any) {
            console.error('[PIPELINE_VISION] ✗ SYSTEM_FAULT:', error.message);
            return 'Visual analysis unvailable for this source.';
        }
    }
};
