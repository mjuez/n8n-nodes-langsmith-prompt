import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class LangSmithApi implements ICredentialType {
	name = 'langSmithApi';
	displayName = 'LangSmith API';
	documentationUrl = 'https://docs.smith.langchain.com/reference/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'US',
					value: 'us',
					description: 'United States (api.smith.langchain.com)',
				},
				{
					name: 'EU',
					value: 'eu',
					description: 'Europe (eu.api.smith.langchain.com)',
				},
			],
			default: 'us',
			required: true,
			description: 'Select the LangSmith API region',
		},
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
	];

	// This test function will verify that the credentials are valid
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.region === "eu" ? "https://eu.api.smith.langchain.com" : "https://api.smith.langchain.com"}}',
			url: '/api/v1/prompts/',
			method: 'GET',
			headers: {
				'x-api-key': '={{$credentials.langSmithApiKey}}',
			},
		},
	};
}
