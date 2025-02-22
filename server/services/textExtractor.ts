import mammoth from 'mammoth';
import docxParser from 'docx-parser';
import type { File } from 'multer';

export async function extractText(file: Express.Multer.File): Promise<string> {
  const fileType = file.originalname.toLowerCase().split('.').pop();
  let text = '';

  try {
    switch (fileType) {
      case 'pdf':
        try {
          if (!file.buffer || file.buffer.length === 0) {
            throw new Error("Invalid PDF buffer");
          }

          // Dynamically import pdf-parse to avoid startup issues
          const pdfParse = await import('pdf-parse');
          const pdfData = await pdfParse.default(file.buffer);
          text = pdfData.text;

          if (!text || text.trim().length === 0) {
            throw new Error("No text content extracted from PDF");
          }
        } catch (pdfError: any) {
          console.error("PDF parsing error:", pdfError);
          throw new Error(`Failed to parse PDF: ${pdfError.message}`);
        }
        break;

      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
        text = docxResult.value;
        break;

      case 'doc':
        text = await new Promise((resolve, reject) => {
          docxParser.parseDocument(file.buffer, (error: Error | null, output: string) => {
            if (error) reject(error);
            resolve(output);
          });
        });
        break;

      case 'txt':
      default:
        text = file.buffer.toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      throw new Error(`No text content extracted from ${fileType} file`);
    }

    if (text.length > 5000000) {
      throw new Error("Text content exceeds 5,000,000 characters");
    }

    return text;
  } catch (error: any) {
    console.error(`Text extraction error for ${fileType}:`, error);
    throw new Error(`Failed to extract text from ${fileType} file: ${error.message}`);
  }
}