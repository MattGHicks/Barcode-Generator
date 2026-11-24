import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit, tooLarge } from '@/lib/security';

const MAX_DESCRIPTION = 500;

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'ai-assist', 5, 60_000) || tooLarge(request, 8 * 1024);
  if (limited) return limited;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI assistance is not enabled. You can still use the manual form below to generate barcodes!' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    if (description.length > MAX_DESCRIPTION) {
      return NextResponse.json(
        { error: `Description is too long (max ${MAX_DESCRIPTION} characters)` },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    const raw = JSON.parse(content.text);

    // Only pass through the expected fields, with sane bounds
    const num = (v: unknown, d: number, min: number, max: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
    };
    const config = {
      prefix: String(raw?.prefix ?? '').toUpperCase().replace(/[^0-9A-Z \-.$/+%]/g, '').slice(0, 32),
      startNumber: Math.round(num(raw?.startNumber, 1, 0, 99_999_999)),
      count: Math.round(num(raw?.count, 10, 1, 1000)),
      pageWidth: num(raw?.pageWidth, 1.5, 0.5, 8.5),
      pageHeight: num(raw?.pageHeight, 1.0, 0.5, 11),
      reasoning: String(raw?.reasoning ?? '').slice(0, 500),
    };

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
