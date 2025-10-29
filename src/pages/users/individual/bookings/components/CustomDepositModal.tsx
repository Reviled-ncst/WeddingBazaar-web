import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, TrendingUp, Heart, Sparkles } from 'lucide-react';

interface CustomDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (depositAmount: number, percentage: number) => void;
  vendorName?: string;
  serviceType?: string;
  currencySymbol?: string;
}

export const CustomDepositModal: React.FC<CustomDepositModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
  vendorName = 'Vendor',
  currencySymbol = '₱'
}) => {
  const [percentage, setPercentage] = useState<number>(30);
  const [customAmount, setCustomAmount] = useState<number>(Math.round(totalAmount * 0.3));
  const [inputMode, setInputMode] = useState<'percentage' | 'amount'>('percentage');
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  const minPercentage = 10;
  const maxPercentage = 100;
  const minAmount = Math.round(totalAmount * (minPercentage / 100));
  const maxAmount = totalAmount;

  const validateAmount = React.useCallback((amount: number) => {
    if (amount < minAmount) {
      setError(`Minimum deposit is ${currencySymbol}${minAmount.toLocaleString()} (${minPercentage}%)`);
      setIsValid(false);
    } else if (amount > maxAmount) {
      setError(`Maximum deposit is ${currencySymbol}${maxAmount.toLocaleString()} (100%)`);
      setIsValid(false);
    } else {
      setError('');
      setIsValid(true);
    }
  }, [minAmount, maxAmount, currencySymbol, minPercentage]);

  useEffect(() => {
    if (inputMode === 'percentage') {
      setCustomAmount(Math.round(totalAmount * (percentage / 100)));
    } else {
      setPercentage(Math.round((customAmount / totalAmount) * 100));
    }
  }, [totalAmount, inputMode, percentage, customAmount]);

  useEffect(() => {
    if (inputMode === 'percentage') {
      const calculatedAmount = Math.round(totalAmount * (percentage / 100));
      setCustomAmount(calculatedAmount);
      validateAmount(calculatedAmount);
    }
  }, [percentage, inputMode, totalAmount, validateAmount]);

  useEffect(() => {
    if (inputMode === 'amount') {
      const calculatedPercentage = Math.round((customAmount / totalAmount) * 100);
      setPercentage(calculatedPercentage);
      validateAmount(customAmount);
    }
  }, [customAmount, inputMode, totalAmount, validateAmount]);

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setInputMode('percentage');
    setPercentage(Math.max(minPercentage, Math.min(maxPercentage, value)));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
    setInputMode('amount');
    setCustomAmount(value);
  };

  const handlePresetClick = (preset: number) => {
    setInputMode('percentage');
    setPercentage(preset);
  };

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(customAmount, percentage);
      onClose();
    }
  };

  const handleClose = () => {
    setPercentage(30);
    setCustomAmount(Math.round(totalAmount * 0.3));
    setInputMode('percentage');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-indigo-900/30 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-pink-100"
          >
            {/* Decorative Background Elements - Symmetrical */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header - Centered and Symmetrical */}
            <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    Custom Deposit
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </h3>
                </div>
                <p className="text-pink-100 text-sm leading-relaxed max-w-md">
                  Choose your preferred deposit amount for <span className="font-bold text-white">{vendorName}</span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-6 right-6 text-white/90 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="relative p-8 space-y-6">
              {/* Total Amount Display - Centered */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl" />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Total Booking Amount</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                      {currencySymbol}{totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  Quick Presets
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((preset, index) => (
                    <motion.button
                      key={preset}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetClick(preset)}
                      className={`relative py-4 px-4 rounded-2xl font-bold transition-all overflow-hidden ${
                        percentage === preset
                          ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl shadow-pink-500/50'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md'
                      }`}
                    >
                      {percentage === preset && (
                        <motion.div
                          layoutId="activePreset"
                          className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-purple-400/30 rounded-2xl"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                      )}
                      <span className="relative flex flex-col items-center gap-1">
                        <span className="text-2xl">{preset}%</span>
                        {preset === 100 && <span className="text-xs opacity-80">Full</span>}
                        {preset === 10 && <span className="text-xs opacity-80">Min</span>}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Percentage Slider - Centered */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 text-center">
                  Deposit Percentage
                </label>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full relative">
                    <input
                      type="range"
                      min={minPercentage}
                      max={maxPercentage}
                      value={percentage}
                      onChange={handlePercentageChange}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          rgb(236, 72, 153) 0%, 
                          rgb(168, 85, 247) ${percentage}%, 
                          rgb(229, 231, 235) ${percentage}%, 
                          rgb(229, 231, 235) 100%)`
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl px-6 py-3 border-2 border-purple-200">
                    <input
                      type="number"
                      min={minPercentage}
                      max={maxPercentage}
                      value={percentage}
                      onChange={handlePercentageChange}
                      className="w-20 px-3 py-2 bg-white border-2 border-purple-300 rounded-lg text-center font-bold text-gray-800 text-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <span className="text-purple-600 font-bold text-xl">%</span>
                  </div>
                </div>
              </div>

              {/* Amount Input - Centered */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 text-center">
                  Deposit Amount
                </label>
                <div className="relative max-w-sm mx-auto">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 font-bold text-xl pointer-events-none">
                    {currencySymbol}
                  </div>
                  <input
                    type="text"
                    value={customAmount.toLocaleString()}
                    onChange={handleAmountChange}
                    className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl font-bold text-xl text-center focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all ${
                      !isValid 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-purple-300 bg-gradient-to-br from-purple-50/50 to-pink-50/50 text-gray-800'
                    }`}
                    placeholder="Enter amount"
                  />
                  {isValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Success Info */}
              {isValid && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-bold mb-1 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Deposit Ready
                    </p>
                    <p>
                      You will pay <span className="font-bold text-blue-900">{currencySymbol}{customAmount.toLocaleString()}</span> ({percentage}%) now.
                      Remaining: <span className="font-bold text-blue-900">{currencySymbol}{(totalAmount - customAmount).toLocaleString()}</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Minimum Deposit Info */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-bold mb-1">Minimum Deposit Required</p>
                    <p>
                      Pay at least <span className="font-bold">{minPercentage}%</span> ({currencySymbol}{minAmount.toLocaleString()}) to confirm your booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex gap-3 border-t-2 border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-md"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: isValid ? 1.02 : 1 }}
                whileTap={{ scale: isValid ? 0.98 : 1 }}
                onClick={handleConfirm}
                disabled={!isValid}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isValid
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white hover:shadow-xl hover:shadow-pink-500/50'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Proceed to Payment
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
