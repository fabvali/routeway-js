import { Client } from 'routeway.js';

const client = new Client(process.env.ROUTEWAY_API_KEY!);

async function main() {
  const response = await client.chat.completions.create({
    model: 'deepseek-v3.2',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' }
    ],
    temperature: 0.7,
    max_tokens: 100
  });

  console.log(response.choices[0].message.content);
}

main().catch(console.error);
