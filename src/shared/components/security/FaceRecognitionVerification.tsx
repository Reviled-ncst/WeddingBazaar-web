import React, { useRef, useEffect, useState } from 'react';
import { Camera, CheckCircle, XCircle, RotateCcw, User, Shield, AlertTriangle } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionVerificationProps {
  userId: string;
  onVerificationComplete: (success: boolean, faceDescriptor?: Float32Array) => void;
  onClose: () => void;
  mode: 'registration' | 'verification';
  storedFaceDescriptor?: Float32Array;
}

export const FaceRecognitionVerification: React.FC<FaceRecognitionVerificationProps> = ({
  userId,
  onVerificationComplete,
  onClose,
  mode,
  storedFaceDescriptor
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'loading' | 'ready' | 'capturing' | 'processing' | 'success' | 'failed'>('loading');
  const [detectedFaces, setDetectedFaces] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [instructions, setInstructions] = useState('Loading face recognition models...');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);

  // Initialize face recognition models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setInstructions('Loading AI models for face recognition...');
        
        // Load required models from public directory
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        
        setInstructions('Starting camera...');
        await startCamera();
        
        setStep('ready');
        setInstructions(mode === 'registration' 
          ? 'Look directly at the camera and click "Capture Face" when ready'
          : 'Look directly at the camera to verify your identity'
        );
        setIsLoading(false);
        
      } catch (error) {
        console.error('Failed to load face recognition models:', error);
        setError('Failed to initialize face recognition. Please refresh and try again.');
        setStep('failed');
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      setStep('failed');
    }
  };

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    // Clear previous drawings
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw face detections
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }

    setDetectedFaces(detections.length);
    
    return detections;
  };

  const captureFace = async () => {
    setIsCapturing(true);
    setStep('capturing');
    setInstructions('Hold still... Capturing your face...');

    try {
      const detections = await detectFaces();
      
      if (detections.length === 0) {
        setError('No face detected. Please ensure your face is clearly visible and try again.');
        setStep('ready');
        setInstructions('No face detected. Position your face in the center of the frame.');
        setIsCapturing(false);
        return;
      }

      if (detections.length > 1) {
        setError('Multiple faces detected. Please ensure only your face is visible.');
        setStep('ready');
        setInstructions('Multiple faces detected. Please ensure only your face is visible.');
        setIsCapturing(false);
        return;
      }

      const faceDescriptor = detections[0].descriptor;
      setCapturedDescriptor(faceDescriptor);
      
      setStep('processing');
      setInstructions('Processing face data...');

      if (mode === 'registration') {
        // For registration, save the face descriptor
        await saveFaceDescriptor(faceDescriptor);
        setStep('success');
        setInstructions('Face successfully registered! You can now use face recognition to log in.');
        onVerificationComplete(true, faceDescriptor);
      } else {
        // For verification, compare with stored descriptor
        if (!storedFaceDescriptor) {
          setError('No stored face data found. Please register your face first.');
          setStep('failed');
          setIsCapturing(false);
          return;
        }

        const distance = faceapi.euclideanDistance(faceDescriptor, storedFaceDescriptor);
        const similarity = Math.max(0, 1 - distance);
        const confidencePercent = Math.round(similarity * 100);
        
        setConfidence(confidencePercent);

        if (similarity > 0.6) { // Threshold for face match
          setStep('success');
          setInstructions(`Face verified with ${confidencePercent}% confidence!`);
          onVerificationComplete(true, faceDescriptor);
        } else {
          setStep('failed');
          setError(`Face verification failed. Confidence: ${confidencePercent}%. Please try again.`);
          onVerificationComplete(false);
        }
      }
    } catch (error) {
      console.error('Face capture error:', error);
      setError('Failed to process face data. Please try again.');
      setStep('failed');
      onVerificationComplete(false);
    }

    setIsCapturing(false);
  };

  const saveFaceDescriptor = async (descriptor: Float32Array) => {
    try {
      const response = await fetch('/api/auth/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          faceDescriptor: Array.from(descriptor) // Convert to regular array for JSON
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save face data');
      }
    } catch (error) {
      console.error('Failed to save face descriptor:', error);
      throw error;
    }
  };

  const resetCapture = () => {
    setStep('ready');
    setError(null);
    setConfidence(0);
    setCapturedDescriptor(null);
    setInstructions(mode === 'registration' 
      ? 'Look directly at the camera and click "Capture Face" when ready'
      : 'Look directly at the camera to verify your identity'
    );
  };

  // Continuous face detection for live feedback
  useEffect(() => {
    if (step === 'ready' && videoRef.current) {
      const interval = setInterval(() => {
        detectFaces();
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step]);

  const getStepColor = () => {
    switch (step) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed': return <XCircle className="h-6 w-6 text-red-500" />;
      case 'processing': return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />;
      default: return <Camera className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'registration' ? 'Register Face' : 'Verify Identity'}
                </h2>
                <p className="text-gray-600">
                  {mode === 'registration' 
                    ? 'Set up face recognition for secure login'
                    : 'Verify your identity using face recognition'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            {getStepIcon()}
            <span className={`text-lg font-medium ${getStepColor()}`}>
              {instructions}
            </span>
          </div>

          {/* Camera View */}
          <div className="relative mb-6">
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              
              {/* Face Detection Overlay */}
              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-2 rounded-xl">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Faces: {detectedFaces}</span>
                </div>
              </div>

              {/* Confidence Display */}
              {confidence > 0 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Confidence: {confidence}%</span>
                  </div>
                </div>
              )}

              {/* Face Detection Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Ensure good lighting and face the camera directly</li>
              <li>• Remove sunglasses, hats, or face coverings</li>
              <li>• Keep your face within the circle guide</li>
              <li>• Stay still during capture for best results</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {(step === 'ready') && (
              <button
                onClick={captureFace}
                disabled={isCapturing || detectedFaces !== 1}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  detectedFaces === 1 && !isCapturing
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCapturing ? 'Capturing...' : 'Capture Face'}
              </button>
            )}

            {(step === 'failed' || error) && (
              <button
                onClick={resetCapture}
                className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center space-x-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
            )}

            {step === 'success' && (
              <button
                onClick={onClose}
                className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Complete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
