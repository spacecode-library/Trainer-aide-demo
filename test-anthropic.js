// Quick test script for Anthropic API
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;

console.log('🔍 Testing Anthropic API Connection...');
console.log(`   API Key exists: ${!!apiKey}`);
console.log(`   API Key format: ${apiKey ? apiKey.substring(0, 20) + '...' : 'N/A'}`);
console.log('');

if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found in environment');
  process.exit(1);
}

const client = new Anthropic({
  apiKey: apiKey,
  timeout: 30000, // 30 second timeout for test
});

async function testAPI() {
  const startTime = Date.now();

  try {
    console.log('📡 Sending test request to Anthropic API...');
    console.log(`   Model: claude-sonnet-4-5-20250929`);
    console.log(`   Max tokens: 100`);
    console.log('');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Say "API test successful" and nothing else.',
        },
      ],
    });

    const duration = Date.now() - startTime;

    console.log('✅ API Connection Successful!');
    console.log('');
    console.log('Response Details:');
    console.log(`   Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Stop reason: ${response.stop_reason}`);
    console.log(`   Input tokens: ${response.usage.input_tokens}`);
    console.log(`   Output tokens: ${response.usage.output_tokens}`);
    console.log(`   Total tokens: ${response.usage.input_tokens + response.usage.output_tokens}`);
    console.log('');

    const textContent = response.content.find(block => block.type === 'text');
    if (textContent) {
      console.log(`   Response: "${textContent.text}"`);
    }
    console.log('');

    // Performance assessment
    if (duration < 5000) {
      console.log('🚀 Performance: EXCELLENT (< 5s)');
    } else if (duration < 15000) {
      console.log('✅ Performance: GOOD (5-15s)');
    } else if (duration < 30000) {
      console.log('⚠️  Performance: SLOW (15-30s) - May cause timeouts with large requests');
    } else {
      console.log('❌ Performance: VERY SLOW (> 30s) - Will likely timeout');
    }

    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('');
    console.error('❌ API Test Failed');
    console.error('');
    console.error(`   Duration before error: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);

    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }

    if (error.error) {
      console.error(`   API Error: ${JSON.stringify(error.error, null, 2)}`);
    }

    console.error('');

    // Diagnose common issues
    if (error.message.includes('Invalid API Key')) {
      console.error('🔧 Diagnosis: API key is invalid or malformed');
      console.error('   Solution: Check ANTHROPIC_API_KEY in .env file');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('🔧 Diagnosis: Network timeout or slow connection');
      console.error('   Solution: Check internet connection or try again');
    } else if (error.message.includes('rate limit')) {
      console.error('🔧 Diagnosis: API rate limit exceeded');
      console.error('   Solution: Wait a few minutes and try again');
    } else if (error.status === 401) {
      console.error('🔧 Diagnosis: Authentication failed');
      console.error('   Solution: Verify API key is correct and active');
    } else if (error.status === 429) {
      console.error('🔧 Diagnosis: Too many requests');
      console.error('   Solution: Wait before retrying');
    } else if (error.status >= 500) {
      console.error('🔧 Diagnosis: Anthropic service error');
      console.error('   Solution: Check https://status.anthropic.com');
    }

    process.exit(1);
  }
}

testAPI();
