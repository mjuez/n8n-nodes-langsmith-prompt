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
			baseURL: 'https://api.smith.langchain.com',
			url: '/api/v1/prompts/',
			method: 'GET',
			headers: {
				'x-api-key': '={{$credentials.langSmithApiKey}}',
			},
		},
	};
}
