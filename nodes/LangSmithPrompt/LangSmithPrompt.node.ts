import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
	fetchPromptTemplateByName,
	invokePromptRaw,
	PromptParameters,
} from './LangSmithHelper';

export class LangSmithPrompt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LangSmith Prompt',
		name: 'langSmithPrompt',
		icon: 'file:langsmith.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["promptName"] || "LangSmith Prompt"}}',
		description: 'Fill in a prompt template stored in LangSmith',
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
				description: 'The name of the prompt template in your LangSmith account',
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
				description: 'Parameters to substitute in the prompt template',
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
								description: 'Parameter name that appears in the template like {name}',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to substitute in the template',
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
		const returnData: INodeExecutionData[] = [];

		try {
			// Get credentials and parameters
			const credentials = await this.getCredentials('langSmithApi');
			const promptName = this.getNodeParameter('promptName', 0) as string;
			const inputParametersData = this.getNodeParameter('inputParameters.parameters', 0, []) as Array<{ name: string; value: string }>;

			// Build parameters object
			const promptParameters: PromptParameters = {};
			for (const param of inputParametersData) {
				promptParameters[param.name] = param.value;
			}

			// Fetch prompt template
			const langSmithApiKey = credentials.langSmithApiKey as string;
			const region = credentials.region as string;
			const promptTemplate = await fetchPromptTemplateByName(promptName, langSmithApiKey, region);
			if (!promptTemplate) {
				throw new NodeOperationError(this.getNode(), `Prompt with name "${promptName}" not found`);
			}

			// Process template with parameters
			const finalPrompt = invokePromptRaw(promptTemplate, promptParameters);

			// Return result
			returnData.push({
				json: {
					[promptName]: finalPrompt
				},
			});

			return [returnData];
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error);
		}
	}
}
