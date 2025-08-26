import React from 'react';
import { Download, Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface PDFDownloadButtonProps {
  onDownload: () => void;
  isDownloading: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PDFDownloadButton({
  onDownload,
  isDownloading,
  hasError,
  hasSuccess,
  errorMessage,
  disabled = false,
  className = '',
  size = 'md'
}: PDFDownloadButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getButtonState = () => {
    if (isDownloading) {
      return {
        icon: <Loader className={`${iconSizes[size]} animate-spin`} />,
        text: 'Generating...',
        colorClass: 'text-blue-600 hover:text-blue-800'
      };
    }
    
    if (hasError) {
      return {
        icon: <AlertCircle className={iconSizes[size]} />,
        text: 'Retry',
        colorClass: 'text-red-600 hover:text-red-800'
      };
    }
    
    if (hasSuccess) {
      return {
        icon: <CheckCircle className={iconSizes[size]} />,
        text: 'Downloaded',
        colorClass: 'text-green-600 hover:text-green-800'
      };
    }
    
    return {
      icon: <Download className={iconSizes[size]} />,
      text: 'Download',
      colorClass: 'text-amber-600 hover:text-amber-800'
    };
  };

  const { icon, text, colorClass } = getButtonState();

  return (
    <div className="relative">
      <button
        onClick={onDownload}
        disabled={disabled || isDownloading}
        className={`
          flex items-center space-x-1 transition-colors 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${colorClass} ${sizeClasses[size]} ${className}
        `}
        title={hasError ? errorMessage : text}
      >
        {icon}
        <span>{text}</span>
      </button>
      
      {hasError && errorMessage && (
        <div className="absolute top-full left-0 mt-1 z-10">
          <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1 text-xs text-red-700 max-w-48 shadow-lg">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}