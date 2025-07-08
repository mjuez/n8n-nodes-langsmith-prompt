// LangSmithHelper.ts
// Helper functions for LangSmith prompt fetching and formatting

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
async function httpGetJson(url: string, apiKey: string): Promise<any> {
  try {
    // Using n8n's fetch instead of Node.js https module
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
