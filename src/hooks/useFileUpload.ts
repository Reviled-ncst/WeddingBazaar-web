import { useState } from 'react';
import { cloudinaryService } from '../services/cloudinaryService';

export interface FileUploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
    error: null
  });

  const uploadFile = async (file: File, folder: string = 'messages'): Promise<FileUploadResult> => {
    setUploadProgress({
      progress: 0,
      isUploading: true,
      error: null
    });

    try {
      console.log('📁 [FileUpload] Starting upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder
      });

      // Validate file size (max 10MB for messages)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Set progress to indicate upload starting
      setUploadProgress(prev => ({ ...prev, progress: 25 }));

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(file, folder);
      
      // Set progress to indicate upload completing
      setUploadProgress(prev => ({ ...prev, progress: 75 }));

      const uploadResult: FileUploadResult = {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };

      console.log('✅ [FileUpload] Upload successful:', uploadResult);
      
      // Complete upload
      setUploadProgress({
        progress: 100,
        isUploading: false,
        error: null
      });

      return uploadResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('❌ [FileUpload] Upload failed:', error);
      
      setUploadProgress({
        progress: 0,
        isUploading: false,
        error: errorMessage
      });

      throw error;
    }
  };

  const resetUpload = () => {
    setUploadProgress({
      progress: 0,
      isUploading: false,
      error: null
    });
  };

  return {
    uploadFile,
    uploadProgress,
    resetUpload
  };
};
