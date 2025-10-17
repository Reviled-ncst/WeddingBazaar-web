import React, { useRef, useState } from 'react';
import { Paperclip, Image as ImageIcon, Upload, X, File, CheckCircle } from 'lucide-react';
import { useFileUpload } from '../../../hooks/useFileUpload';

interface FileAttachmentProps {
  onFileUpload: (attachment: {url: string, fileName: string, fileType: string, fileSize: number}) => void;
  disabled?: boolean;
}

interface PendingFile {
  file: File;
  preview?: string;
  id: string;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ onFileUpload, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const { uploadFile, uploadProgress, resetUpload } = useFileUpload();

  const handleFileSelect = (files: FileList, isImage: boolean = false) => {
    const newPendingFiles: PendingFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (isImage && file.type.startsWith('image/')) {
        // Create preview for images
        const reader = new FileReader();
        reader.onload = (e) => {
          newPendingFiles.push({
            file,
            preview: e.target?.result as string,
            id
          });
          setPendingFiles(prev => [...prev, ...newPendingFiles]);
        };
        reader.readAsDataURL(file);
      } else {
        newPendingFiles.push({
          file,
          id
        });
      }
    }
    
    if (!isImage || newPendingFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newPendingFiles]);
    }
  };

  const uploadPendingFile = async (pendingFile: PendingFile) => {
    try {
      resetUpload();
      const folder = pendingFile.file.type.startsWith('image/') ? 'messages/images' : 'messages/files';
      const result = await uploadFile(pendingFile.file, folder);
      
      onFileUpload({
        url: result.url,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize
      });
      
      // Remove from pending files
      setPendingFiles(prev => prev.filter(f => f.id !== pendingFile.id));
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      {/* Upload Buttons */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploadProgress.isUploading}
          className="p-3 text-purple-400 hover:text-purple-600 rounded-2xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || uploadProgress.isUploading}
          className="p-3 text-purple-400 hover:text-purple-600 rounded-2xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
          aria-label="Attach image"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        aria-label="Select files to attach"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files, true)}
        accept="image/*"
        aria-label="Select images to attach"
      />

      {/* Upload Progress */}
      {uploadProgress.isUploading && (
        <div className="absolute bottom-full mb-4 left-0 right-0 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-2xl p-4 shadow-2xl z-50">
          <div className="flex items-center space-x-3 mb-3">
            <Upload className="h-5 w-5 text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Uploading files...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${Math.round(uploadProgress.progress)}%` }}
              role="progressbar"
              aria-label="Upload progress"
              aria-valuenow={Math.round(uploadProgress.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {uploadProgress.error && (
            <p className="text-sm text-red-500 mt-2 font-medium">{uploadProgress.error}</p>
          )}
        </div>
      )}

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="absolute bottom-full mb-4 left-0 right-0 min-w-96 max-w-lg bg-white/95 backdrop-blur-lg border border-purple-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50">
          <div className="p-6">
            <h4 className="text-lg font-bold text-purple-700 mb-4 flex items-center">
              <Paperclip className="h-5 w-5 mr-3" />
              Files to upload:
            </h4>
            <div className="space-y-4">
              {pendingFiles.map((pendingFile) => (
                <div key={pendingFile.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
                  {pendingFile.preview ? (
                    <div className="relative">
                      <img 
                        src={pendingFile.preview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="text-white">
                          <p className="text-sm font-medium">Image file</p>
                          <p className="text-xs opacity-90">
                            {formatFileSize(pendingFile.file.size)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => uploadPendingFile(pendingFile)}
                            disabled={uploadProgress.isUploading}
                            className="p-2 bg-green-500/80 text-white hover:bg-green-600 rounded-xl disabled:opacity-50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                            aria-label="Upload file"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removePendingFile(pendingFile.id)}
                            disabled={uploadProgress.isUploading}
                            className="p-2 bg-red-500/80 text-white hover:bg-red-600 rounded-xl disabled:opacity-50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 p-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <File className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-gray-800">Document</p>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatFileSize(pendingFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => uploadPendingFile(pendingFile)}
                          disabled={uploadProgress.isUploading}
                          className="p-3 text-green-600 hover:text-green-700 rounded-2xl hover:bg-green-50 disabled:opacity-50 transition-all duration-200 hover:scale-110 shadow-lg"
                          aria-label="Upload file"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removePendingFile(pendingFile.id)}
                          disabled={uploadProgress.isUploading}
                          className="p-3 text-red-500 hover:text-red-600 rounded-2xl hover:bg-red-50 disabled:opacity-50 transition-all duration-200 hover:scale-110 shadow-lg"
                          aria-label="Remove file"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
