import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a barcode generation configuration assistant. The user wants to generate Code39 barcodes and has described their needs. Based on their description, suggest optimal configuration values.

User's description: "${description}"

Respond ONLY with a JSON object (no markdown, no explanation) with these fields:
{
  "prefix": "string (e.g., '1001', 'ASSET', 'PROD')",
  "startNumber": number (starting number, e.g., 1),
  "count": number (how many barcodes, 1-1000),
  "pageWidth": number (in inches, typically 1.5-4.0),
  "pageHeight": number (in inches, typically 1.0-3.0),
  "reasoning": "brief explanation of your choices"
}

Examples:
- "I need 100 asset tags" → {"prefix":"ASSET","startNumber":1,"count":100,"pageWidth":1.5,"pageHeight":1.0,"reasoning":"Standard asset tag format"}
- "50 product labels starting from 5000" → {"prefix":"PROD","startNumber":5000,"count":50,"pageWidth":2.0,"pageHeight":1.5,"reasoning":"Larger labels for product identification"}
- "Inventory codes from 1 to 200" → {"prefix":"INV","startNumber":1,"count":200,"pageWidth":1.5,"pageHeight":1.0,"reasoning":"Inventory tracking labels"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse Claude's JSON response
    const config = JSON.parse(content.text);

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('AI assist error:', error);

    // Check if it's a credit balance error
    if (error?.status === 400 && error?.message?.includes('credit balance')) {
      return NextResponse.json(
        { error: 'API credits required. You can still use the manual form below to generate barcodes!' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'AI assistance unavailable. You can still use the manual form to generate barcodes!' },
      { status: 500 }
    );
  }
}
