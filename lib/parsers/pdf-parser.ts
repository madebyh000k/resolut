// Use require for CommonJS module compatibility
// Handle both default export and direct export patterns
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

export interface ParsedPDF {
  text: string;
  pages: number;
  metadata?: {
    title?: string;
    author?: string;
    [key: string]: any;
  };
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      pages: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        ...data.info,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
