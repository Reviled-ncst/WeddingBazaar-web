// Export the modular payment system
export { PayMongoPaymentModal as PayMongoPaymentModalModular } from './PayMongoPaymentModalModular';

// Export individual payment components
export { default as CardPayment } from './payment/CardPayment';
export { default as GCashPayment } from './payment/GCashPayment';
export { default as MayaPayment } from './payment/MayaPayment';
export { default as GrabPayPayment } from './payment/GrabPayPayment';

// For backward compatibility, also export the original modal
export { PayMongoPaymentModal } from './PayMongoPaymentModal';
