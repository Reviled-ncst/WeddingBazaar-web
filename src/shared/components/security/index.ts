export { EmailVerification } from './EmailVerification';
export { PhoneVerification } from './PhoneVerification';
export { SecuritySettings } from './SecuritySettings';
export { DocumentUploader, type ExtractedDocumentData } from './DocumentUploader';

// Face recognition available (face-api.js already installed)
// Temporarily commented out for build - face-api.js dependency issue
// export { FaceRecognitionVerification } from './FaceRecognitionVerification';

export type VerificationType = 'email' | 'phone' | 'face';

export interface SecurityVerificationProps {
  userId: string;
  onVerificationComplete: (success: boolean) => void;
  onClose: () => void;
}

export interface SecurityProfile {
  email: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasFaceRecognition?: boolean;
}
