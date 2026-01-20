import * as dotenv from 'dotenv';
import path from 'path';
import { LLMConfig } from '../types/index';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const llmConfig: LLMConfig = {
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.LLM_API_KEY || '',
    temperature: 0.7,
    maxTokens: 500,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
};

export default llmConfig;