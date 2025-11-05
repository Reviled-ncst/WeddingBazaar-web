import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, FileText, AlertTriangle, Loader } from 'lucide-react';
import { createWorker, type Worker } from 'tesseract.js';

interface DocumentUploaderProps {
  userId: string;
  onUploadComplete: (imageUrl: string, extractedData: ExtractedDocumentData) => void;
  onClose: () => void;
}

export interface ExtractedDocumentData {
  name?: string;
  idNumber?: string;
  dateOfBirth?: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  rawText: string;
  confidence: number;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  onUploadComplete,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'select' | 'type' | 'preview' | 'processing' | 'extracted'>('select');
  const [documentType, setDocumentType] = useState<'passport' | 'drivers_license' | 'national_id'>('national_id');
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setStep('type');
  };

  const validateImageQuality = async (file: File): Promise<{ valid: boolean; message?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check minimum resolution
        if (img.width < 800 || img.height < 600) {
          resolve({ 
            valid: false, 
            message: 'Image resolution too low. Please use a higher quality image (min 800x600).' 
          });
          return;
        }
        
        // Check aspect ratio (should be somewhat rectangular for IDs)
        const aspectRatio = img.width / img.height;
        if (aspectRatio < 1.2 || aspectRatio > 2.5) {
          resolve({ 
            valid: false, 
            message: 'Image doesn\'t appear to be an ID card. Please capture the full document.' 
          });
          return;
        }
        
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        resolve({ valid: false, message: 'Failed to load image. Please try a different file.' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const parseIDDocument = (text: string, type: string): ExtractedDocumentData => {
    // Clean up text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    console.log('📄 OCR Raw Text:', cleanText);
    
    // Extract name (common patterns)
    const namePatterns = [
      /(?:Name|NAME|Full Name|FULL NAME)[:\s]*([A-Z][A-Za-z\s]{5,50})/,
      /(?:Surname|SURNAME|Last Name|LAST NAME)[:\s]*([A-Z][A-Za-z\s]{2,30})/,
      /([A-Z][A-Z\s]{10,50})\s+(?:Date|DOB|Birth)/i
    ];
    
    let name: string | undefined;
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        name = match[1].trim();
        break;
      }
    }
    
    // Extract ID number (various formats)
    const idPatterns = [
      /(?:ID|License|Number|No\.?)[:\s]*([A-Z0-9-]{5,20})/i,
      /([A-Z]\d{7,12})/,  // Common format: A1234567
      /(\d{9,12})/,       // Common format: 123456789
      /([A-Z0-9]{10,15})/ // Alphanumeric
    ];
    
    let idNumber: string | undefined;
    for (const pattern of idPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        idNumber = match[1].trim();
        break;
      }
    }
    
    // Extract date of birth (various formats)
    const dobPatterns = [
      /(?:DOB|Date of Birth|Birth Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(?:DOB|Date of Birth|Birth Date)[:\s]*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/  // Any date format
    ];
    
    let dateOfBirth: string | undefined;
    for (const pattern of dobPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        dateOfBirth = match[1].trim();
        break;
      }
    }
    
    // Calculate confidence score
    let confidence = 0;
    if (name) confidence += 33;
    if (idNumber) confidence += 34;
    if (dateOfBirth) confidence += 33;
    
    return {
      name,
      idNumber,
      dateOfBirth,
      documentType: type as any,
      rawText: cleanText,
      confidence
    };
  };

  const processDocument = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setStep('processing');
    setProgress(0);
    setError(null);
    
    try {
      // Step 1: Validate image quality
      setProgress(10);
      const qualityCheck = await validateImageQuality(selectedFile);
      if (!qualityCheck.valid) {
        setError(qualityCheck.message || 'Image quality check failed');
        setIsProcessing(false);
        return;
      }
      
      // Step 2: Upload to Cloudinary
      setProgress(30);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'wedding_documents'); // You'll need to create this preset
      
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { secure_url } = await uploadResponse.json();
      
      // Step 3: Run OCR extraction
      setProgress(50);
      const worker: Worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(50 + Math.round(m.progress * 40));
          }
        }
      });
      
      const { data: { text, confidence } } = await worker.recognize(selectedFile);
      await worker.terminate();
      
      setProgress(95);
      
      // Step 4: Parse extracted text
      const parsed = parseIDDocument(text, documentType);
      parsed.confidence = Math.round((confidence + parsed.confidence) / 2);
      
      console.log('✅ Extracted Data:', parsed);
      
      setExtractedData(parsed);
      setStep('extracted');
      setProgress(100);
      
      // Call completion handler
      onUploadComplete(secure_url, parsed);
      
    } catch (error) {
      console.error('Document processing failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process document');
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
              aria-label="Close verification dialog"
            >
              <XCircle className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Upload a clear photo of your government-issued ID
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: File Selection */}
          {step === 'select' && (
            <div className="text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 hover:border-rose-500 hover:bg-rose-50/50 cursor-pointer transition-all duration-300"
              >
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Document
                </h3>
                <p className="text-gray-600 mb-4">
                  Click to browse or drag and drop your ID
                </p>
                <p className="text-sm text-gray-500">
                  Supported: JPG, PNG (max 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                title="Upload document"
                aria-label="Upload identity document"
              />
            </div>
          )}

          {/* Step 2: Document Type Selection */}
          {step === 'type' && preview && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Document preview"
                  className="max-h-64 rounded-xl shadow-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Document Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'national_id', label: 'National ID Card', icon: FileText },
                    { value: 'drivers_license', label: 'Driver\'s License', icon: FileText },
                    { value: 'passport', label: 'Passport', icon: FileText }
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        documentType === type.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="documentType"
                        value={type.value}
                        checked={documentType === type.value}
                        onChange={(e) => setDocumentType(e.target.value as any)}
                        className="text-rose-500 focus:ring-rose-500"
                      />
                      <type.icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Change Image
                </button>
                <button
                  onClick={processDocument}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader className="h-16 w-16 text-rose-500 mx-auto mb-6 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Your Document
              </h3>
              <p className="text-gray-600 mb-6">
                Extracting information intelligently...
              </p>
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
              </div>
            </div>
          )}

          {/* Step 4: Extracted Data Review */}
          {step === 'extracted' && extractedData && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    Document processed successfully!
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Extracted Information:</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium text-gray-900">
                      {extractedData.name || 'Not detected'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">ID Number</label>
                    <p className="font-medium text-gray-900">
                      {extractedData.idNumber || 'Not detected'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Date of Birth</label>
                    <p className="font-medium text-gray-900">
                      {extractedData.dateOfBirth || 'Not detected'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Confidence Score</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            extractedData.confidence > 70
                              ? 'bg-green-500'
                              : extractedData.confidence > 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${extractedData.confidence}%` }}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {extractedData.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Pending Admin Review</p>
                      <p>
                        Your document will be reviewed by our team within 24-48 hours. 
                        You'll receive an email once verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
              >
                Done
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
