module.exports = {
	nodeTypes: {
		langSmithPrompt: require('./dist/nodes/LangSmithPrompt/LangSmithPrompt.node.js').LangSmithPrompt,
	},
	credentialTypes: {
		langSmithApi: require('./dist/credentials/LangSmithApi.credentials.js').LangSmithApi,
	},
};
