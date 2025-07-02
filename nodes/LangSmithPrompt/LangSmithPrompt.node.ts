import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { pull } from 'langchain/hub/node';
import * as process from 'process';

export class LangSmithPrompt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LangSmith Prompt',
		name: 'langSmithPrompt',
		icon: 'file:langsmith.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["promptName"]}}',
		description: 'Fetch a prompt from LangSmith, invoke it with parameters, and output the result',
		defaults: {
			name: 'LangSmith Prompt',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Prompt Name',
				name: 'promptName',
				type: 'string',
				default: '',
				required: true,
				description: 'The name of the prompt to fetch from LangSmith',
			},
			{
				displayName: 'Input Parameters',
				name: 'inputParameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {
					parameters: [],
				},
				description: 'Parameters to pass to the prompt when invoking it',
				options: [
					{
						name: 'parameters',
						displayName: 'Parameters',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the parameter to pass to the prompt',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the parameter',
								required: true,
							},
						],
					},
				],
			},
		],
		credentials: [
			{
				name: 'langSmithApi',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		try {
			const credentials = await this.getCredentials('langSmithApi');

			// Get parameters
			const promptName = this.getNodeParameter('promptName', 0) as string;
			
			// Get input parameters for the prompt
			const inputParametersData = this.getNodeParameter('inputParameters.parameters', 0, []) as Array<{
				name: string;
				value: string;
			}>;
			
			// Convert input parameters to an object for prompt invocation
			const promptParameters: Record<string, string> = {};
			for (const param of inputParametersData) {
				promptParameters[param.name] = param.value;
			}
			
			// Set default 'question' parameter if none provided
			if (Object.keys(promptParameters).length === 0) {
				promptParameters.question = 'Hi!';
			}

			// Create an object with the necessary API keys
			const apiKeys = {
				langSmithApiKey: credentials.langSmithApiKey as string,
				anthropicApiKey: credentials.anthropicApiKey as string,
				openAiApiKey: credentials.openAiApiKey as string,
			};

			// Fetch the prompt by name
			const prompt = await pull(promptName, {
				apiKey: apiKeys.langSmithApiKey,
				includeModel: false,
			});

			if (!prompt) {
				throw new NodeOperationError(
					this.getNode(),
					`Prompt with name "${promptName}" not found`,
				);
			}

			const originalAnthropicApiKey = process.env.ANTHROPIC_API_KEY;
			const originalOpenAiApiKey = process.env.OPENAI_API_KEY;

			if (apiKeys.anthropicApiKey) {
				process.env.ANTHROPIC_API_KEY = apiKeys.anthropicApiKey;
			}

			if (apiKeys.openAiApiKey) {
				process.env.OPENAI_API_KEY = apiKeys.openAiApiKey;
			}

			try {
				// Invoke the prompt with the provided parameters
				const formattedPrompt = await prompt.invoke(promptParameters);

                if (!formattedPrompt) {
                    throw new NodeOperationError(
                        this.getNode(),
                        `Failed to format prompt "${promptName}". Please check the prompt configuration.`,
                    );
                }

                // Extract the prompt value from various possible locations
                let finalPrompt = null;
				
				// First check standard property
				if (formattedPrompt.kwargs?.value) {
					finalPrompt = formattedPrompt.kwargs.value;
				} 
				// Check direct value property
				else if (formattedPrompt.value) {
					finalPrompt = formattedPrompt.value;
				} 
				// Check LangChain format
				else if (formattedPrompt.lc_kwargs?.value) {
					finalPrompt = formattedPrompt.lc_kwargs.value;
				}
				// Check other possible properties
				else if (formattedPrompt.text) {
					finalPrompt = formattedPrompt.text;
				}
				else if (formattedPrompt.content) {
					finalPrompt = formattedPrompt.content;
				}
				// Last resort - stringify the object
				else if (typeof formattedPrompt === 'string') {
					finalPrompt = formattedPrompt;
				}
				else {
					finalPrompt = JSON.stringify(formattedPrompt);
				}

                // Output the prompt with the prompt name as the key
                returnData.push({
                    json: {
                        [promptName]: finalPrompt,
                    },
                    pairedItem: { item: 0 },
                });

			} finally {
				// Restore original environment variables
				if (originalAnthropicApiKey) {
					process.env.ANTHROPIC_API_KEY = originalAnthropicApiKey;
				} else {
					delete process.env.ANTHROPIC_API_KEY;
				}

				if (originalOpenAiApiKey) {
					process.env.OPENAI_API_KEY = originalOpenAiApiKey;
				} else {
					delete process.env.OPENAI_API_KEY;
				}
			}
		} catch (error) {
			if (this.continueOnFail()) {
				// Add error to all items
				for (let i = 0; i < items.length; i++) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
				}
			} else {
				throw new NodeOperationError(this.getNode(), error);
			}
		}

		return [returnData];
	}
}
