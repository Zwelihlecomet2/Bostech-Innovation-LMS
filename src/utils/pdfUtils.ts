import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFGenerationOptions {
  maxRetries?: number;
  timeout?: number;
  chunkSize?: number;
}

export class PDFGenerationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'PDFGenerationError';
  }
}

export const validatePDFData = (data: any): boolean => {
  if (!data) return false;
  
  // Add specific validation logic based on your data structure
  if (typeof data !== 'object') return false;
  
  return true;
};

export const sanitizeFilename = (filename: string): string => {
  // Remove or replace invalid characters for filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200); // Limit filename length
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const checkBrowserSupport = (): boolean => {
  // Check if browser supports PDF generation
  try {
    const testDoc = new jsPDF();
    return !!testDoc;
  } catch (error) {
    return false;
  }
};

export const generatePDFWithRetry = async (
  generateFn: () => Promise<jsPDF>,
  options: PDFGenerationOptions = {}
): Promise<jsPDF> => {
  const { maxRetries = 3, timeout = 30000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new PDFGenerationError('PDF generation timeout', 'TIMEOUT')), timeout);
      });
      
      const pdfPromise = generateFn();
      const pdf = await Promise.race([pdfPromise, timeoutPromise]);
      
      return pdf;
    } catch (error) {
      console.warn(`PDF generation attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new PDFGenerationError(
          `PDF generation failed after ${maxRetries} attempts: ${error.message}`,
          'MAX_RETRIES_EXCEEDED'
        );
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new PDFGenerationError('Unexpected error in PDF generation', 'UNKNOWN');
};