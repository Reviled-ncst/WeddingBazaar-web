import React from 'react';
import { Shield, Lock, Eye, Database, Users, Globe, Settings, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      {/* Enhanced Header */}
      <div className="relative text-center mb-8">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-2xl"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <div className="relative p-4 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl shadow-2xl shadow-green-500/25 group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>
            <div className="absolute inset-px bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            <Lock className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 skew-x-12"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent mb-2 relative z-10">
          Privacy Policy
        </h2>
        <p className="text-gray-600 text-lg relative z-10">How We Protect Your Personal Information</p>
        <p className="text-sm text-gray-500 mt-2">Last updated: August 30, 2025</p>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-y-auto space-y-8 text-gray-700 leading-relaxed">
        
        {/* 1. Information We Collect */}
        <section>
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">1. Information We Collect</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              <strong>Personal Information:</strong> When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Wedding date and location (for couples)</li>
              <li>Business information and certifications (for vendors)</li>
              <li>Profile photos and portfolio images</li>
            </ul>
            <p>
              <strong>Usage Data:</strong> We automatically collect information about how you use our platform, including pages visited, features used, and interaction patterns.
            </p>
            <p>
              <strong>Communication Data:</strong> Messages sent through our platform, reviews, and customer support interactions.
            </p>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section>
          <div className="flex items-center mb-4">
            <Settings className="h-6 w-6 text-purple-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              We use your information to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Provide and improve our platform services</li>
              <li>Connect couples with appropriate vendors</li>
              <li>Facilitate communication and bookings</li>
              <li>Send important updates and notifications</li>
              <li>Provide customer support</li>
              <li>Analyze platform usage and improve user experience</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
            <p>
              <strong>Marketing Communications:</strong> With your consent, we may send promotional emails about new features, vendor highlights, and wedding planning tips.
            </p>
          </div>
        </section>

        {/* 3. Information Sharing */}
        <section>
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-rose-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">3. How We Share Your Information</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              <strong>With Vendors:</strong> When you contact or book a vendor, we share relevant contact information and event details.
            </p>
            <p>
              <strong>With Couples:</strong> Vendors can view basic information about couples who contact them, including name, event date, and location.
            </p>
            <p>
              <strong>Service Providers:</strong> We may share data with trusted third-party services that help us operate our platform (payment processors, email services, analytics).
            </p>
            <p>
              <strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and users' safety.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <p className="text-amber-800">
                  <strong>We never sell your personal information</strong> to third parties for marketing purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Data Security */}
        <section>
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">4. Data Security</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>SSL encryption for data transmission</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and employee training</li>
              <li>Secure payment processing through certified providers</li>
            </ul>
            <p>
              However, no internet transmission is 100% secure. We encourage you to use strong passwords and protect your account credentials.
            </p>
          </div>
        </section>

        {/* 5. Your Rights and Choices */}
        <section>
          <div className="flex items-center mb-4">
            <Eye className="h-6 w-6 text-indigo-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">5. Your Rights & Choices</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Update:</strong> Correct or update your account information</li>
              <li><strong>Delete:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a common format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict:</strong> Limit how we process your information</li>
            </ul>
            <p>
              To exercise these rights, contact us at privacy@weddingbazaar.com or through your account settings.
            </p>
          </div>
        </section>

        {/* 6. Cookies and Tracking */}
        <section>
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-orange-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">6. Cookies & Tracking Technologies</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Remember your preferences and login status</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content and recommendations</li>
              <li>Improve security and prevent fraud</li>
            </ul>
            <p>
              You can control cookie settings through your browser preferences. Note that disabling cookies may affect platform functionality.
            </p>
          </div>
        </section>

        {/* 7. Data Retention */}
        <section>
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-gray-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">7. Data Retention</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              We retain your information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Active account data: Retained while your account is active</li>
              <li>Communication history: Retained for customer support purposes</li>
              <li>Transaction records: Retained for legal and tax requirements</li>
              <li>Deleted accounts: Some data may be retained for legal compliance</li>
            </ul>
          </div>
        </section>

        {/* 8. Third-Party Services */}
        <section>
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">8. Third-Party Services</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              Our platform integrates with third-party services:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Payment Processors:</strong> Stripe, PayPal for secure transactions</li>
              <li><strong>Analytics:</strong> Google Analytics for usage insights</li>
              <li><strong>Communication:</strong> Email and SMS service providers</li>
              <li><strong>Maps:</strong> Google Maps for location services</li>
            </ul>
            <p>
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </div>
        </section>

        {/* 9. Children's Privacy */}
        <section>
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">9. Children's Privacy</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              Our platform is not intended for children under 16. We do not knowingly collect personal information from children under 16.
            </p>
            <p>
              If you believe we have collected information from a child under 16, please contact us immediately at privacy@weddingbazaar.com.
            </p>
          </div>
        </section>

        {/* 10. International Users */}
        <section>
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-purple-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">10. International Data Transfers</h3>
          </div>
          <div className="pl-9 space-y-3">
            <p>
              Wedding Bazaar operates globally. Your information may be transferred to and processed in countries other than your own.
            </p>
            <p>
              We ensure appropriate safeguards are in place to protect your information during international transfers, in compliance with applicable privacy laws.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Privacy Questions?</h3>
          </div>
          <div className="space-y-2">
            <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
            <div className="space-y-1 text-sm">
              <p><strong>Privacy Team:</strong> privacy@weddingbazaar.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@weddingbazaar.com</p>
              <p><strong>Address:</strong> Wedding Bazaar Privacy Office, 123 Main Street, City, State 12345</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          We are committed to protecting your privacy and handling your data responsibly.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          I Understand
        </button>
      </div>
    </Modal>
  );
};
