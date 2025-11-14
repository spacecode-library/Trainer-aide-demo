/**
 * Test which Claude models are available
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function testModels() {
  const modelsToTest = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  console.log('🧪 Testing available Claude models...\n');

  for (const model of modelsToTest) {
    try {
      console.log(`Testing: ${model}...`);
      const response = await anthropic.messages.create({
        model,
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say "test successful"' }],
      });

      console.log(`✅ ${model} - WORKS`);
      console.log(`   Response: ${(response.content[0] as any).text}\n`);
    } catch (error: any) {
      console.log(`❌ ${model} - FAILED`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

testModels();
