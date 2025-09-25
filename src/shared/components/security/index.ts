export { EmailVerification } from './EmailVerification';
export { PhoneVerification } from './PhoneVerification';
export { SecuritySettings } from './SecuritySettings';

// Face recognition will be available once face-api.js is installed
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
