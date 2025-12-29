import { NextRequest, NextResponse } from 'next/server';
import { generateCodes, generateAllBarcodes, BarcodeConfig } from '@/lib/barcode-generator';
import { createPDF } from '@/lib/pdf-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const config: BarcodeConfig = {
      prefix: body.prefix || '',
      startNumber: parseInt(body.startNumber) || 1,
      count: parseInt(body.count) || 10,
      scale: parseInt(body.scale) || 4,
      height: parseInt(body.height) || 15,
      width: parseInt(body.width) || 38,
    };

    // Determine codes - either from uploaded file or generated sequence
    let codes: string[];

    if (body.codes && Array.isArray(body.codes) && body.codes.length > 0) {
      // Use codes from file upload
      codes = body.codes;
      if (codes.length > 1000) {
        return NextResponse.json(
          { error: 'Maximum 1000 barcodes allowed per request' },
          { status: 400 }
        );
      }
    } else {
      // Validate limits for generated codes
      if (config.count > 1000) {
        return NextResponse.json(
          { error: 'Maximum 1000 barcodes allowed per request' },
          { status: 400 }
        );
      }
      // Generate codes from config
      codes = generateCodes(config);
    }

    // Generate barcode images
    const barcodes = await generateAllBarcodes(codes, config);

    // Create PDF
    const pdfBuffer = await createPDF(barcodes, {
      pageWidth: parseFloat(body.pageWidth) || 1.5,
      pageHeight: parseFloat(body.pageHeight) || 1.0,
      fontSize: parseInt(body.fontSize) || 12,
      fontFamily: body.fontFamily || 'Helvetica-Bold',
      leftRightMargin: 6,
      topMargin: 3,
      spaceBetween: 4,
    });

    // Return PDF as downloadable file
    let filename: string;
    if (body.codes && Array.isArray(body.codes) && body.codes.length > 0) {
      // For uploaded codes, use simpler filename
      filename = `barcodes_${codes.length}_items.pdf`;
    } else {
      const prefixPart = config.prefix ? `${config.prefix}_` : '';
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
