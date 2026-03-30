import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function listModels() {
    if (!API_KEY) {
        console.error('No API key found.');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Using a v1-friendly way to list if possible
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
        const data = await response.json();
        
        console.log('--- AVAILABLE MODELS (v1) ---');
        console.log(JSON.stringify(data, null, 2));

        const responseBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const dataBeta = await responseBeta.json();
        
        console.log('\n--- AVAILABLE MODELS (v1beta) ---');
        console.log(JSON.stringify(dataBeta, null, 2));

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
