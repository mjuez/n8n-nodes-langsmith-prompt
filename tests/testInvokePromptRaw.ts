// testInvokePromptRaw.ts
// Simple test for the invokePromptRaw function

import { invokePromptRaw } from '../nodes/LangSmithPrompt/LangSmithHelper';

function testInvokePromptRaw() {
  console.log('Testing invokePromptRaw function...');
  
  // Test case 1: Basic template substitution
  const template1 = 'This is your question: "{Question}"';
  const params1 = { Question: 'hi?' };
  const result1 = invokePromptRaw(template1, params1);
  console.log('Test 1 Result:', result1);
  console.log('Expected:', 'This is your question: "hi?"');
  console.log('Passed:', result1 === 'This is your question: "hi?"');
  
  // Test case 2: Multiple parameters
  const template2 = 'Hello {Name}, your age is {Age}';
  const params2 = { Name: 'John', Age: '30' };
  const result2 = invokePromptRaw(template2, params2);
  console.log('\nTest 2 Result:', result2);
  console.log('Expected:', 'Hello John, your age is 30');
  console.log('Passed:', result2 === 'Hello John, your age is 30');
  
  // Test case 3: Parameter with quotes
  const template3 = 'The answer is {"Answer"}';
  const params3 = { Answer: '42' };
  const result3 = invokePromptRaw(template3, params3);
  console.log('\nTest 3 Result:', result3);
  console.log('Expected:', 'The answer is 42');
  console.log('Passed:', result3 === 'The answer is 42');
}

testInvokePromptRaw();
