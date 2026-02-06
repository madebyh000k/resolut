import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ClaudeResponse {
  text: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function callClaude(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<ClaudeResponse> {
  try {
    const message = await anthropic.messages.create({
      model: options?.model || 'claude-sonnet-4-5-20250929',
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return {
      text: textContent.text,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.message} (Status: ${error.status})`);
    }
    throw error;
  }
}

export async function callClaudeWithRetry(
  prompt: string,
  maxRetries: number = 3,
  options?: Parameters<typeof callClaude>[1]
): Promise<ClaudeResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callClaude(prompt, options);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRateLimitError =
        error instanceof Anthropic.APIError && error.status === 429;

      if (isRateLimitError && !isLastAttempt) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}
