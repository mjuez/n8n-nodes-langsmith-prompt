import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LangSmithApi implements ICredentialType {
	name = 'langSmithApi';
	displayName = 'LangSmith API';
	documentationUrl = 'https://docs.smith.langchain.com/reference/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'LangSmith API Key',
			name: 'langSmithApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your LangSmith API Key',
		},
		{
			displayName: 'OpenAI API Key',
			name: 'openAiApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'Your OpenAI API Key',
		},
		{
			displayName: 'Anthropic API Key',
			name: 'anthropicApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'Your Anthropic API Key',
		},
	];
}
