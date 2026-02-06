import mammoth from 'mammoth';

export interface ParsedDOCX {
  text: string;
  messages: string[];
}

export async function parseDOCX(buffer: Buffer): Promise<ParsedDOCX> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      messages: result.messages.map((m) => m.message),
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
