import React from 'react';
import { Download, File, ExternalLink } from 'lucide-react';

interface MessageAttachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
}

export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({ attachments }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => (
        <div key={index}>
          {attachment.fileType.startsWith('image/') ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={attachment.url}
                alt="Image attachment"
                className="w-full max-w-sm h-auto object-cover cursor-pointer rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 max-h-80"
                onClick={() => window.open(attachment.url, '_blank')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl"></div>
              <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                <button
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="p-1.5 bg-white/90 text-gray-700 hover:bg-white rounded-lg shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  aria-label="Open image"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDownload(attachment.url, attachment.fileName)}
                  className="p-1.5 bg-white/90 text-gray-700 hover:bg-white rounded-lg shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  aria-label="Download image"
                >
                  <Download className="h-3 w-3" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                  {formatFileSize(attachment.fileSize)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-3 max-w-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-md">
                  <File className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">Document</p>
                  <p className="text-xs text-gray-600">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="p-2 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-200 hover:scale-105"
                    aria-label="Open file"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(attachment.url, attachment.fileName)}
                    className="p-2 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-200 hover:scale-105"
                    aria-label="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
