declare module 'docx-parser' {
  export function parseDocument(
    buffer: Buffer,
    callback: (error: Error | null, output: string) => void
  ): void;
}
