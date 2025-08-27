// testLangSmithHelper.ts
// Simple test script to fetch and invoke a LangSmith prompt using the helper utilities

import { fetchPromptTemplateByName, invokePromptRaw } from '../nodes/LangSmithPrompt/LangSmithHelper';

function getEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  // Fallback: try to read from .env file manually (no dependencies)
  try {
    const fs = require('fs');
    const envPath = '.env';
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match && match[1] === key) {
          return match[2].replace(/^['"]|['"]$/g, '');
        }
      }
    }
  } catch {}
  return undefined;
}

async function main() {
  const promptName = 'n8n-variable-test';
  const langSmithApiKey = getEnv('LANGSMITH_API_KEY') || '';
  if (!langSmithApiKey) {
    console.error('LANGSMITH_API_KEY is not set in .env');
    process.exit(1);
  }
  try {
    const prompt = await fetchPromptTemplateByName(promptName, langSmithApiKey, 'us');
    console.log('Fetched prompt:', prompt);
    if (!prompt) {
      throw new Error(`Prompt with name "${promptName}" not found`);
    }
    const promptParameters = { Question: 'Hi!' };
    const finalPrompt = invokePromptRaw(prompt, promptParameters);
    console.log('Prompt output:', finalPrompt);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
