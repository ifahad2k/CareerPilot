// ============================================================
// CareerPilot v2 — CV Parser
// ============================================================
// 
// Extracts raw text from PDF and DOCX files
// Uses pdf-parse for PDFs, mammoth for DOCX
// ============================================================

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parse a CV file (PDF or DOCX) and extract raw text
 * 
 * @param file - File object from form upload
 * @returns Extracted text content
 */
export async function parseCV(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.name.endsWith('.pdf')) {
    try {
      const result = await pdfParse(buffer);
      return result.text;
    } catch {
      // Fallback: try as plain text
      return buffer.toString('utf-8');
    }
  }

  if (file.name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Please upload PDF or DOCX.');
}
