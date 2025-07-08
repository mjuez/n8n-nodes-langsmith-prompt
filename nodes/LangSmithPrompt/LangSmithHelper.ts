// LangSmithHelper.ts
// Helper functions for LangSmith prompt fetching and formatting

import * as https from 'https';

export interface PromptParameters {
  [key: string]: string;
}

/**
 * Fetch a prompt template by name from LangSmith API.
 */
export async function fetchPromptTemplateByName(promptName: string, apiKey: string): Promise<string | null> {
  const url = `https://api.smith.langchain.com/commits/-/${encodeURIComponent(promptName)}/latest`;
  
  try {
    const res = await httpGetJson(url, apiKey);
    return res?.manifest?.kwargs?.template || null;
  } catch (error) {
    console.error('Error fetching prompt template:', error);
    return null;
  }
}

/**
 * Process a prompt template by replacing variables with their values.
 * Supports format: "{variable}" or {variable}
 */
export function invokePromptRaw(promptTemplate: string, params: PromptParameters): string {
  let result = promptTemplate;
  
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`\\{\\s*"?${key}"?\\s*\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Make a GET request and parse JSON response.
 */
function httpGetJson(url: string, apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}
