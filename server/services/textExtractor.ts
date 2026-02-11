import mammoth from "mammoth";
import docxParser from "docx-parser";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractText(file: Express.Multer.File): Promise<string> {
  const fileType = file.originalname.toLowerCase().split(".").pop();
  let text = "";

  try {
    switch (fileType) {
      case "pdf": {
        if (!file.buffer?.length) {
          throw new Error("Invalid PDF buffer");
        }

        const pdfData = await pdfParse(Buffer.from(file.buffer));
        text = pdfData.text;
        break;
      }
      case "docx": {
        const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
        text = docxResult.value;
        break;
      }
      case "doc": {
        text = await new Promise((resolve, reject) => {
          docxParser.parseDocument(file.buffer, (error: Error | null, output: string) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(output);
          });
        });
        break;
      }
      case "txt":
      default:
        text = file.buffer.toString("utf-8");
    }

    if (!text?.trim()) {
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
