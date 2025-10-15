// Simplified header with working modal close
const handleRegisterModalClose = () => {
  console.log('🚪 Modal close requested');
  
  // Clear verification state when modal closes
  localStorage.removeItem('emailVerificationPending');
  setIsEmailVerificationMode(false);
  
  console.log('✅ Closing RegisterModal');
  setIsRegisterModalOpen(false);
};
