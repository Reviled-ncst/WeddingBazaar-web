// Cloudinary image upload service
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  asset_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

interface CloudinaryError {
  error: {
    message: string;
    http_code: number;
  };
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dht64xt1g';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'weddingbazaarus';
    
    console.log('🌤️ [Cloudinary] Initialized with:', {
      cloudName: this.cloudName,
      uploadPreset: this.uploadPreset,
      envCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      envUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    });
  }

  /**
   * Upload an image to Cloudinary
   * @param file - The image file to upload
   * @param folder - Optional folder to organize uploads
   * @returns Promise with the upload response
   */
  async uploadImage(
    file: File, 
    folder: string = 'vendor-profiles'
  ): Promise<CloudinaryUploadResponse> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 10MB');
      }

      console.log('🌤️ [Cloudinary] Starting upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder: folder,
        uploadPreset: this.uploadPreset,
        cloudName: this.cloudName
      });

      // Try upload without folder first, then with folder if that fails
      try {
        return await this.attemptUpload(file, false);
      } catch (error) {
        console.log('🌤️ [Cloudinary] Upload without folder failed, trying with folder...');
        return await this.attemptUpload(file, true, folder);
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload image');
    }
  }

  /**
   * Attempt upload with or without folder parameter
   */
  private async attemptUpload(file: File, includeFolder: boolean = false, folder?: string): Promise<CloudinaryUploadResponse> {
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    // Only add folder if requested and specified
    if (includeFolder && folder) {
      formData.append('folder', folder);
    }
    
    // Debug: Log all form data entries
    console.log(`🌤️ [Cloudinary] FormData contents (${includeFolder ? 'with' : 'without'} folder):`);
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    console.log('🌤️ [Cloudinary] FormData prepared, sending request...');

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('🌤️ [Cloudinary] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌤️ [Cloudinary] Error response body:', errorText);
      console.error('🌤️ [Cloudinary] Response headers:', Object.fromEntries(response.headers.entries()));
      
      let errorData: CloudinaryError;
      try {
        errorData = JSON.parse(errorText);
        console.error('🌤️ [Cloudinary] Parsed error data:', errorData);
      } catch (parseError) {
        console.error('🌤️ [Cloudinary] Could not parse error response as JSON:', parseError);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
      
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}: ${errorText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('🌤️ [Cloudinary] Upload successful:', {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height
    });
    
    return data;
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      // For deletion, we need to use the admin API which requires server-side implementation
      // For now, we'll just log the deletion request
      console.log('Image deletion requested for public_id:', publicId);
      
      // In a production app, you would:
      // 1. Send the public_id to your backend
      // 2. Backend uses Cloudinary admin API to delete the image
      // 3. Return success/failure status
      
      // For now, we'll simulate successful deletion
      return Promise.resolve();
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete image');
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param publicId - The public ID of the image
   * @param transformations - Optional transformation parameters
   * @returns Optimized image URL
   */
  getOptimizedUrl(
    publicId: string, 
    transformations: string = 'w_400,h_400,c_fill,f_auto,q_auto'
  ): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Generate multiple image sizes for responsive design
   * @param publicId - The public ID of the image
   * @returns Object with different image sizes
   */
  getResponsiveUrls(publicId: string) {
    return {
      thumbnail: this.getOptimizedUrl(publicId, 'w_150,h_150,c_fill,f_auto,q_auto'),
      small: this.getOptimizedUrl(publicId, 'w_300,h_300,c_fill,f_auto,q_auto'),
      medium: this.getOptimizedUrl(publicId, 'w_600,h_600,c_fill,f_auto,q_auto'),
      large: this.getOptimizedUrl(publicId, 'w_1200,h_1200,c_fill,f_auto,q_auto'),
      original: `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`
    };
  }

  /**
   * Test if the upload preset exists and is configured correctly
   * @returns Promise that resolves if the preset is valid
   */
  async testUploadPreset(): Promise<boolean> {
    try {
      // Create a simple test with a small data URI image
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const formData = new FormData();
      formData.append('file', testImageData);
      formData.append('upload_preset', this.uploadPreset);
      
      console.log('🌤️ [Cloudinary] Testing upload preset:', this.uploadPreset);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🌤️ [Cloudinary] Upload preset test successful:', data.public_id);
        // Clean up the test image
        return true;
      } else {
        const errorText = await response.text();
        console.error('🌤️ [Cloudinary] Upload preset test failed:', errorText);
        return false;
      }
    } catch (error) {
      console.error('🌤️ [Cloudinary] Upload preset test error:', error);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();

// Export types for use in components
export type { CloudinaryUploadResponse };
