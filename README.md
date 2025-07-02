![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-langsmith-prompt

This is an n8n community node. It lets you use LangSmith in your n8n workflows.

LangSmith is a platform for debugging, testing, evaluating, and monitoring LLM applications, allowing you to manage prompts and track their performance.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- **Fetch and Invoke Prompt**: Fetches a specific prompt from LangSmith by name, invokes it with your custom parameters, and outputs the result using the prompt name as the output key.

## Credentials

You need a LangSmith API key to use this node.

1. Sign up for an account at [LangSmith](https://smith.langchain.com/)
2. Generate an API key in your account settings
3. Use this API key in the LangSmith API credentials in n8n

## Compatibility

This node has been tested with n8n version 1.0.0 and later.

## Usage

1. Add the LangSmith Prompt node to your workflow
2. Configure the LangSmith API credentials with your API key
3. Enter the Prompt Name of the prompt you want to fetch from LangSmith
4. Add Input Parameters to pass to the prompt when invoking it:
   - Click "Add Parameter" to add key-value pairs
   - For each parameter, provide:
     - Name: The parameter name required by your prompt
     - Value: The value to pass for that parameter
5. The prompt will be invoked with your parameters and the result will be available in the node's output using the prompt name as the key

### Example Input Parameters

If your prompt expects a "question" parameter, add a parameter with:

- Name: question
- Value: What is artificial intelligence?

If your prompt expects multiple parameters like "topic" and "tone", add two parameters:

- Name: topic
- Value: Machine Learning

- Name: tone
- Value: Professional

The node outputs the processed LangSmith prompt using the prompt name as the key. For example, if your prompt name is "my-prompt", the output of the node will be:

```json
{
  "my-prompt": "Your processed LangSmith prompt content here"
}
```

You can then reference this output in subsequent nodes using expressions such as:

```javascript
{{$node["LangSmith Prompt"].json["my-prompt"]}}
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [LangSmith documentation](https://docs.smith.langchain.com/)
- [LangSmith API reference](https://docs.smith.langchain.com/reference/)

## License

[MIT](LICENSE.md)
