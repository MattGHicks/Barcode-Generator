import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Parse workbook
    const workbook = XLSX.read(data, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: 'No sheets found in file' },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (raw data)
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Extract values from the first column, filtering out empty rows and headers
    const codes: string[] = [];
    for (const row of rows) {
      if (row && row[0] !== undefined && row[0] !== null && row[0] !== '') {
        const value = String(row[0]).trim();
        // Skip if it looks like a header (common header names)
        if (value && !isHeaderRow(value)) {
          codes.push(value);
        }
      }
    }

    if (codes.length === 0) {
      return NextResponse.json(
        { error: 'No valid codes found in the first column' },
        { status: 400 }
      );
    }

    if (codes.length > 1000) {
      return NextResponse.json(
        { error: `Too many codes (${codes.length}). Maximum is 1000.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      codes,
      count: codes.length,
      fileName: file.name,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file. Please ensure it is a valid spreadsheet.' },
      { status: 500 }
    );
  }
}

function isHeaderRow(value: string): boolean {
  const lowerValue = value.toLowerCase();
  const headerKeywords = [
    'number', 'code', 'barcode', 'id', 'sku', 'item', 'product',
    'asset', 'serial', 'picker', 'name', 'label', 'tag', 'ref', 'reference'
  ];
  // Check if value contains any header keyword (handles "Picker ID", "Item Number", etc.)
  if (headerKeywords.some(keyword => lowerValue.includes(keyword))) {
    return true;
  }
  // Check if it's just a "#" symbol
  if (value === '#') {
    return true;
  }
  return false;
}
