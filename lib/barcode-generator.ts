import bwipjs from 'bwip-js';

export interface BarcodeData {
  code: string;
  imageBuffer: Buffer;
}

export interface BarcodeConfig {
  prefix: string;
  startNumber: number;
  count: number;
  scale: number;
  height: number;
  width: number;
}

/**
 * Generate a single Code39 barcode as a PNG buffer
 */
export async function generateBarcode(
  text: string,
  config: Partial<BarcodeConfig> = {}
): Promise<Buffer> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code39',
      text: text,
      scale: config.scale || 4,
      height: 15,  // Bar height in mm (original working value)
      width: 38,   // Module width in mm (original working value)
      includetext: false,
      paddingleft: 0,
      paddingright: 0,
      paddingtop: 2,
      paddingbottom: 2,
    });

    return png;
  } catch (error) {
    throw new Error(`Failed to generate barcode for "${text}": ${error}`);
  }
}

/**
 * Generate codes based on configuration
 */
export function generateCodes(config: BarcodeConfig): string[] {
  const codes: string[] = [];
  const { prefix, startNumber, count } = config;

  for (let i = 0; i < count; i++) {
    const currentNumber = startNumber + i;
    const paddedNumber = currentNumber.toString().padStart(4, '0');
    const code = prefix ? `${prefix} ${paddedNumber}` : paddedNumber;
    codes.push(code);
  }

  return codes;
}

/**
 * Generate all barcodes with progress tracking
 */
export async function generateAllBarcodes(
  codes: string[],
  config: Partial<BarcodeConfig> = {},
  onProgress?: (current: number, total: number) => void
): Promise<BarcodeData[]> {
  const barcodes: BarcodeData[] = [];

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const imageBuffer = await generateBarcode(code, config);
    barcodes.push({ code, imageBuffer });

    if (onProgress) {
      onProgress(i + 1, codes.length);
    }
  }

  return barcodes;
}
