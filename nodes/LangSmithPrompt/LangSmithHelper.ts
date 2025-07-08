// LangSmithHelper.ts
// Helper functions for LangSmith prompt fetching and formatting

import * as process from 'process';

export interface LangSmithApiKeys {
  langSmithApiKey: string;
  anthropicApiKey?: string;
  openAiApiKey?: string;
}

export interface PromptParameters {
  [key: string]: string;
}

export interface LangSmithPrompt {
  invoke: (params: PromptParameters) => Promise<any>;
}

export async function fetchPrompt(promptName: string, apiKey: string): Promise<LangSmithPrompt> {
  // Use dynamic import so langchain/langsmith is not a direct dependency
  const { pull } = await import('langchain/hub/node');
  return pull(promptName, { apiKey, includeModel: false });
}

export function setApiEnvVars(apiKeys: LangSmithApiKeys): { originalAnthropicApiKey?: string; originalOpenAiApiKey?: string } {
  const originalAnthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const originalOpenAiApiKey = process.env.OPENAI_API_KEY;
  if (apiKeys.anthropicApiKey) process.env.ANTHROPIC_API_KEY = apiKeys.anthropicApiKey;
  if (apiKeys.openAiApiKey) process.env.OPENAI_API_KEY = apiKeys.openAiApiKey;
  return { originalAnthropicApiKey, originalOpenAiApiKey };
}

export function restoreApiEnvVars(original: { originalAnthropicApiKey?: string; originalOpenAiApiKey?: string }) {
  if (original.originalAnthropicApiKey) process.env.ANTHROPIC_API_KEY = original.originalAnthropicApiKey;
  else delete process.env.ANTHROPIC_API_KEY;
  if (original.originalOpenAiApiKey) process.env.OPENAI_API_KEY = original.originalOpenAiApiKey;
  else delete process.env.OPENAI_API_KEY;
}

export function extractPromptValue(formattedPrompt: any): string {
  if (formattedPrompt.kwargs?.value) return formattedPrompt.kwargs.value;
  if (formattedPrompt.value) return formattedPrompt.value;
  if (formattedPrompt.lc_kwargs?.value) return formattedPrompt.lc_kwargs.value;
  if (formattedPrompt.text) return formattedPrompt.text;
  if (formattedPrompt.content) return formattedPrompt.content;
  if (typeof formattedPrompt === 'string') return formattedPrompt;
  return JSON.stringify(formattedPrompt);
}

export async function invokePrompt(prompt: LangSmithPrompt, promptParameters: PromptParameters): Promise<any> {
  return prompt.invoke(promptParameters);
}
