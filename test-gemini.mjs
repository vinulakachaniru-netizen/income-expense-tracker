import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const envFile = fs.readFileSync('.env.local', 'utf8');
const keyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const key = keyLine ? keyLine.split('=')[1].trim().replace(/['"]/g, '') : null;

const genAI = new GoogleGenerativeAI(key);

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("Models:", data.models?.map(m => m.name).filter(n => n.includes('flash') || n.includes('vision')));
  } catch(e) {
    console.error(e);
  }
}

listModels();
