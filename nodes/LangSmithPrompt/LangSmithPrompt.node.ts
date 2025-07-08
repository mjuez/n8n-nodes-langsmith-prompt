import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
  fetchPrompt,
  setApiEnvVars,
  restoreApiEnvVars,
  extractPromptValue,
  LangSmithApiKeys,
  PromptParameters,
} from './LangSmithHelper';

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
			const promptName = this.getNodeParameter('promptName', 0) as string;
			const inputParametersData = this.getNodeParameter('inputParameters.parameters', 0, []) as Array<{ name: string; value: string }>;
			const promptParameters: PromptParameters = {};
			for (const param of inputParametersData) {
				promptParameters[param.name] = param.value;
			}
			if (Object.keys(promptParameters).length === 0) {
				promptParameters.question = 'Hi!';
			}
			const apiKeys: LangSmithApiKeys = {
				langSmithApiKey: credentials.langSmithApiKey as string,
				anthropicApiKey: credentials.anthropicApiKey as string,
				openAiApiKey: credentials.openAiApiKey as string,
			};
			const prompt = await fetchPrompt(promptName, apiKeys.langSmithApiKey);
			if (!prompt) {
				throw new NodeOperationError(this.getNode(), `Prompt with name "${promptName}" not found`);
			}
			const originalEnv = setApiEnvVars(apiKeys);
			try {
				const formattedPrompt = await prompt.invoke(promptParameters);
				if (!formattedPrompt) {
					throw new NodeOperationError(this.getNode(), `Failed to format prompt "${promptName}". Please check the prompt configuration.`);
				}
				const finalPrompt = extractPromptValue(formattedPrompt);
				returnData.push({
					json: { [promptName]: finalPrompt },
					pairedItem: { item: 0 },
				});
			} finally {
				restoreApiEnvVars(originalEnv);
			}
		} catch (error) {
			if (this.continueOnFail()) {
				for (let i = 0; i < items.length; i++) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				}
			} else {
				throw new NodeOperationError(this.getNode(), error);
			}
		}
		return [returnData];
	}
}
