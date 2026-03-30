import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
  if (!API_KEY) {
    console.error("API_KEY_MISSING");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  console.log("Checking models for API key...");
  
  try {
    // We try to list models if possible, otherwise we test Flash directly
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("test");
    console.log("✓ SUCCESS: 'gemini-1.5-flash' is supported.");
  } catch (err: any) {
    console.error("✗ FAILURE: 'gemini-1.5-flash' failed. Error:", err.message);
    
    try {
      console.log("Testing 'gemini-pro' (1.0)...");
      const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const resultPro = await modelPro.generateContent("test");
      console.log("✓ SUCCESS: 'gemini-pro' is supported.");
    } catch (err2: any) {
        console.error("✗ FAILURE: 'gemini-pro' also failed.");
    }
  }
}

checkModels();
