import PDFDocument from 'pdfkit';
import { BarcodeData } from './barcode-generator';

export interface PDFOptions {
  pageWidth: number;   // in inches
  pageHeight: number;  // in inches
  fontSize: number;
  fontFamily: string;
  leftRightMargin: number;
  topMargin: number;
  spaceBetween: number;
}

const DEFAULT_OPTIONS: PDFOptions = {
  pageWidth: 1.5,
  pageHeight: 1.0,
  fontSize: 12,
  fontFamily: 'Helvetica-Bold',
  leftRightMargin: 6,
  topMargin: 3,
  spaceBetween: 4,
};

/**
 * Create a PDF document with one barcode per page
 */
export async function createPDF(
  barcodes: BarcodeData[],
  options: Partial<PDFOptions> = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    try {
      // Convert inches to points (72 points = 1 inch)
      const pageWidth = opts.pageWidth * 72;
      const pageHeight = opts.pageHeight * 72;

      // Create PDF document
      const doc = new PDFDocument({
        size: [pageWidth, pageHeight],
        margin: 0,
      });

      // Collect PDF chunks in memory
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Process each barcode
      barcodes.forEach((barcode, index) => {
        // Add new page for each barcode (except the first)
        if (index > 0) {
          doc.addPage();
        }

        try {
          // Calculate dimensions
          const textHeight = 14;
          const barcodeWidth = pageWidth - (2 * opts.leftRightMargin);

          // Add barcode image (bars only, no text)
          doc.image(barcode.imageBuffer, opts.leftRightMargin, opts.topMargin, {
            width: barcodeWidth,
            align: 'center',
          });

          // Add text below barcode with custom font
          const textY = pageHeight - textHeight - 2;
          doc.fontSize(opts.fontSize)
            .font(opts.fontFamily)
            .text(barcode.code, 0, textY, {
              width: pageWidth,
              align: 'center',
              lineBreak: false,
              continued: false,
            });
        } catch (err) {
          console.error(`Error adding barcode ${barcode.code}:`, err);
        }
      });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
