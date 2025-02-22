export async function extractText(file: Express.Multer.File): Promise<string> {
  // For this implementation we'll assume the file is plain text
  // In a production environment, you'd want to handle different file types (PDF, DOC, etc.)
  const text = file.buffer.toString('utf-8');
  
  if (text.length > 5000000) {
    throw new Error("Text content exceeds 5,000,000 characters");
  }
  
  return text;
}
