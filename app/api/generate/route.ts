import { NextRequest, NextResponse } from 'next/server';
import { generateCodes, generateAllBarcodes, BarcodeConfig } from '@/lib/barcode-generator';
import { createPDF } from '@/lib/pdf-builder';
import {
  ALLOWED_FONTS,
  MAX_CODES,
  MAX_JSON_BYTES,
  clampInt,
  clampNumber,
  isValidCode39,
  rateLimit,
  tooLarge,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'generate', 20, 60_000) || tooLarge(request, MAX_JSON_BYTES);
  if (limited) return limited;

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const prefix = typeof body.prefix === 'string' ? body.prefix.trim().toUpperCase().slice(0, 32) : '';

    const config: BarcodeConfig = {
      prefix,
      startNumber: clampInt(body.startNumber, 1, 0, 99_999_999),
      count: clampInt(body.count, 10, 1, MAX_CODES),
      scale: clampInt(body.scale, 4, 1, 8),
      height: 15,
      width: 38,
    };

    // Determine codes - either from uploaded file or generated sequence
    const fromUpload = Array.isArray(body.codes) && body.codes.length > 0;
    let codes: string[];

    if (fromUpload) {
      if (body.codes.length > MAX_CODES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_CODES} barcodes allowed per request` },
          { status: 400 }
        );
      }
      codes = body.codes.map((c: unknown) => String(c ?? '').trim().toUpperCase());
    } else {
      codes = generateCodes(config);
    }

    const invalid = codes.find((c) => !isValidCode39(c));
    if (invalid !== undefined) {
      return NextResponse.json(
        {
          error: `Invalid Code39 value "${invalid.slice(0, 64)}". Allowed: A-Z, 0-9, space and - . $ / + % (max 64 chars).`,
        },
        { status: 400 }
      );
    }

    // Generate barcode images
    const barcodes = await generateAllBarcodes(codes, config);

    const fontFamily = ALLOWED_FONTS.has(body.fontFamily) ? body.fontFamily : 'Helvetica-Bold';

    // Create PDF
    const pdfBuffer = await createPDF(barcodes, {
      pageWidth: clampNumber(body.pageWidth, 1.5, 0.5, 8.5),
      pageHeight: clampNumber(body.pageHeight, 1.0, 0.5, 11),
      fontSize: clampInt(body.fontSize, 12, 4, 48),
      fontFamily,
      leftRightMargin: 6,
      topMargin: 3,
      spaceBetween: 4,
    });

    // Return PDF as downloadable file
    let filename: string;
    if (fromUpload) {
      filename = `barcodes_${codes.length}_items.pdf`;
    } else {
      const safePrefix = config.prefix.replace(/[^A-Z0-9-]/g, '_');
      const prefixPart = safePrefix ? `${safePrefix}_` : '';
      filename = `barcodes_${prefixPart}${config.startNumber}-${config.startNumber + config.count - 1}.pdf`;
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcodes' },
      { status: 500 }
    );
  }
}
