import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface CompletionProofFile {
  url: string;
  publicId: string;
  uploadedAt: string;
  fileType: string;
  size: number;
  duration?: number; // For videos
  description?: string;
}

interface CompletionProofUploaderProps {
  onFilesUploaded: (files: CompletionProofFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  existingFiles?: CompletionProofFile[];
  disabled?: boolean;
}

export const CompletionProofUploader: React.FC<CompletionProofUploaderProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
  existingFiles = [],
  disabled = false
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<CompletionProofFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dkuzcopaw'; // Your Cloudinary cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'wedding_bazaar_unsigned'; // Your unsigned preset

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} not supported. Please upload images (JPEG, PNG, WebP) or videos (MP4, MOV).`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum ${maxFileSize}MB.`;
    }

    // Check max files limit
    if (uploadedFiles.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed.`;
    }

    return null;
  }, [acceptedTypes, maxFileSize, uploadedFiles.length, maxFiles]);

  const uploadToCloudinary = async (file: File): Promise<CompletionProofFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'wedding-bazaar/completion-proofs');

    // Determine resource type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload file to Cloudinary');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      uploadedAt: new Date().toISOString(),
      fileType: file.type,
      size: file.size,
      duration: data.duration || undefined, // For videos
      description: ''
    };
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const newFiles: CompletionProofFile[] = [];

      for (const file of files) {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        // Upload to Cloudinary
        try {
          const uploadedFile = await uploadToCloudinary(file);
          newFiles.push(uploadedFile);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setError(`Failed to upload ${file.name}`);
        }
      }

      if (newFiles.length > 0) {
        const updated = [...uploadedFiles, ...newFiles];
        setUploadedFiles(updated);
        onFilesUploaded(updated);
      }
    } catch (error) {
      console.error('File selection error:', error);
      setError('Failed to process files');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  }, [uploadedFiles, onFilesUploaded, validateFile]);

  const handleRemoveFile = (publicId: string) => {
    const updated = uploadedFiles.filter(f => f.publicId !== publicId);
    setUploadedFiles(updated);
    onFilesUploaded(updated);
  };

  const handleUpdateDescription = (publicId: string, description: string) => {
    const updated = uploadedFiles.map(f => 
      f.publicId === publicId ? { ...f, description } : f
    );
    setUploadedFiles(updated);
    onFilesUploaded(updated);
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const isVideo = (fileType: string) => fileType.startsWith('video/');

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-all",
          disabled || uploadedFiles.length >= maxFiles
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-pink-300 bg-pink-50 hover:bg-pink-100 cursor-pointer",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          id="completion-proof-upload"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled || uploading || uploadedFiles.length >= maxFiles}
          className="hidden"
        />
        
        <label
          htmlFor="completion-proof-upload"
          className={cn(
            "cursor-pointer flex flex-col items-center gap-3",
            (disabled || uploadedFiles.length >= maxFiles) && "cursor-not-allowed"
          )}
        >
          {uploading ? (
            <>
              <Loader className="w-12 h-12 text-pink-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-pink-100 rounded-full">
                <Upload className="w-8 h-8 text-pink-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">
                  Upload Completion Proof
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Click to upload images or videos ({uploadedFiles.length}/{maxFiles})
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Max {maxFileSize}MB per file • JPG, PNG, WebP, MP4, MOV
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Uploaded Files Grid */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.publicId}
                className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFile(file.publicId)}
                  disabled={disabled}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* File Preview */}
                <div className="mb-3">
                  {isVideo(file.fileType) ? (
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        src={file.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={file.url}
                        alt="Completion proof"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Image
                      </div>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.duration && <span>{file.duration}s</span>}
                  </div>

                  {/* Description Input */}
                  <input
                    type="text"
                    placeholder="Add description (optional)..."
                    value={file.description || ''}
                    onChange={(e) => handleUpdateDescription(file.publicId, e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Upload Guidelines
        </h5>
        <ul className="text-blue-800 space-y-1 text-xs">
          <li>• Upload photos or videos showing the completed service</li>
          <li>• Clear, well-lit images work best</li>
          <li>• Include setup, final result, and any special details</li>
          <li>• Maximum {maxFiles} files, {maxFileSize}MB each</li>
          <li>• Supported formats: JPG, PNG, WebP, MP4, MOV</li>
        </ul>
      </div>
    </div>
  );
};
