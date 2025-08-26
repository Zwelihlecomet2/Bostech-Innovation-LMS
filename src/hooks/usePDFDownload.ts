import { useState, useCallback } from 'react';
import { PDFGenerationError, generatePDFWithRetry } from '../utils/pdfUtils';

interface PDFDownloadState {
  isDownloading: boolean;
  error: string | null;
  success: boolean;
}

interface UsePDFDownloadReturn {
  downloadState: PDFDownloadState;
  downloadPDF: (generateFn: () => Promise<any>, filename: string) => Promise<void>;
  clearState: () => void;
}

export const usePDFDownload = (): UsePDFDownloadReturn => {
  const [downloadState, setDownloadState] = useState<PDFDownloadState>({
    isDownloading: false,
    error: null,
    success: false
  });

  const downloadPDF = useCallback(async (
    generateFn: () => Promise<any>,
    filename: string
  ) => {
    setDownloadState({
      isDownloading: true,
      error: null,
      success: false
    });

    try {
      const pdf = await generatePDFWithRetry(generateFn, {
        maxRetries: 3,
        timeout: 30000
      });

      // Trigger download
      pdf.save(filename);

      setDownloadState({
        isDownloading: false,
        error: null,
        success: true
      });

      // Clear success state after 3 seconds
      setTimeout(() => {
        setDownloadState(prev => ({ ...prev, success: false }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof PDFGenerationError 
        ? error.message 
        : 'Failed to generate PDF';

      setDownloadState({
        isDownloading: false,
        error: errorMessage,
        success: false
      });

      // Clear error after 5 seconds
      setTimeout(() => {
        setDownloadState(prev => ({ ...prev, error: null }));
      }, 5000);
    }
  }, []);

  const clearState = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      error: null,
      success: false
    });
  }, []);

  return {
    downloadState,
    downloadPDF,
    clearState
  };
};