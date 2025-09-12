import React from 'react';
import { X, Shield, CheckCircle, AlertTriangle, Users, Heart, Globe, FileText } from 'lucide-react';
import { Modal } from './Modal';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      {/* Enhanced Header */}
      <div className="relative text-center mb-8">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <div className="relative p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-3xl shadow-2xl shadow-blue-500/25 group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>
            <div className="absolute inset-px bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            <Shield className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 skew-x-12"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent mb-2 relative z-10">
          Terms of Service
        </h2>
        <p className="text-gray-600 text-lg relative z-10">Wedding Bazaar Platform Agreement</p>
        <p className="text-sm text-gray-500 mt-2">Last updated: August 30, 2025</p>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-y-auto space-y-8 text-gray-700 leading-relaxed">
        
        {/* 1. Acceptance of Terms */}
        <section>
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              By accessing and using Wedding Bazaar ("Platform", "Service", "we", "us"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <p>
              If you do not agree to abide by the above, please do not use this service. Wedding Bazaar is a platform connecting couples with wedding service providers.
            </p>
          </div>
        </section>

        {/* 2. User Accounts */}
        <section>
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">2. User Accounts & Registration</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              <strong>Account Creation:</strong> You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account information.
            </p>
            <p>
              <strong>Account Types:</strong> We offer two types of accounts:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Couple Accounts:</strong> For individuals planning their wedding</li>
              <li><strong>Vendor Accounts:</strong> For businesses providing wedding services</li>
            </ul>
            <p>
              <strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>
          </div>
        </section>

        {/* 3. Platform Services */}
        <section>
          <div className="flex items-center mb-4">
            <Heart className="h-6 w-6 text-rose-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">3. Platform Services</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              Wedding Bazaar provides a platform for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Connecting couples with wedding service providers</li>
              <li>Browsing and comparing wedding services</li>
              <li>Communication between couples and vendors</li>
              <li>Booking and scheduling services</li>
              <li>Managing wedding planning activities</li>
            </ul>
            <p>
              We act as an intermediary platform and are not directly involved in the actual provision of wedding services.
            </p>
          </div>
        </section>

        {/* 4. User Responsibilities */}
        <section>
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">4. User Responsibilities</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              <strong>Prohibited Activities:</strong> You agree not to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Use the platform for any unlawful purpose</li>
              <li>Impersonate any person or entity</li>
              <li>Upload harmful, offensive, or inappropriate content</li>
              <li>Interfere with the platform's operation</li>
              <li>Attempt to gain unauthorized access to accounts or systems</li>
            </ul>
            <p>
              <strong>Content Standards:</strong> All content you post must be accurate, respectful, and relevant to wedding planning.
            </p>
          </div>
        </section>

        {/* 5. Vendor Responsibilities */}
        <section>
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-purple-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">5. Vendor Responsibilities</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              <strong>Service Providers must:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Maintain current business licenses and certifications</li>
              <li>Provide accurate service descriptions and pricing</li>
              <li>Respond to inquiries in a timely manner</li>
              <li>Deliver services as advertised</li>
              <li>Maintain professional standards</li>
            </ul>
            <p>
              <strong>Verification:</strong> We reserve the right to verify vendor credentials and may suspend accounts that do not meet our standards.
            </p>
          </div>
        </section>

        {/* 6. Payments and Fees */}
        <section>
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">6. Payments & Fees</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              <strong>Platform Fees:</strong> Basic platform access is free. Premium features may require subscription fees.
            </p>
            <p>
              <strong>Transaction Fees:</strong> We may charge fees for facilitating transactions between couples and vendors.
            </p>
            <p>
              <strong>Refund Policy:</strong> Refunds are handled according to individual vendor policies. Platform fees are non-refundable unless required by law.
            </p>
          </div>
        </section>

        {/* 7. Privacy and Data */}
        <section>
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-indigo-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">7. Privacy & Data Protection</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
            <p>
              By using our platform, you consent to the collection and use of information in accordance with our Privacy Policy.
            </p>
          </div>
        </section>

        {/* 8. Limitation of Liability */}
        <section>
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">8. Limitation of Liability</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              Wedding Bazaar provides the platform "as is" without warranties. We are not liable for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Quality of services provided by vendors</li>
              <li>Disputes between couples and vendors</li>
              <li>Loss of data or service interruptions</li>
              <li>Indirect or consequential damages</li>
            </ul>
            <p>
              Our total liability to you for any claim shall not exceed the amount you paid to us in the 12 months preceding the claim.
            </p>
          </div>
        </section>

        {/* 9. Termination */}
        <section>
          <div className="flex items-center mb-4">
            <X className="h-6 w-6 text-gray-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">9. Account Termination</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              We may terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
            </p>
            <p>
              You may delete your account at any time through your account settings. Upon termination, your right to use the platform ceases immediately.
            </p>
          </div>
        </section>

        {/* 10. Changes to Terms */}
        <section>
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">10. Changes to Terms</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notifications.
            </p>
            <p>
              Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
          </div>
          <div className="space-y-2">
            <p>If you have questions about these Terms of Service, please contact us:</p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> legal@weddingbazaar.com</p>
              <p><strong>Address:</strong> Wedding Bazaar Legal Department, 123 Main Street, City, State 12345</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          By continuing to use Wedding Bazaar, you acknowledge that you have read and agree to these Terms of Service.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          I Understand
        </button>
      </div>
    </Modal>
  );
};
