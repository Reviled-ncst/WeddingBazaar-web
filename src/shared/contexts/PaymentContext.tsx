// Payment Context - Global Payment State Management
// Provides payment state and functions across the application

import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { PaymentResult, PaymentBooking, PaymentAmount } from '../types/payment';

interface PaymentTransaction {
  id: string;
  booking: PaymentBooking;
  amount: PaymentAmount;
  paymentType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: PaymentResult;
  timestamp: Date;
}

interface PaymentContextState {
  transactions: PaymentTransaction[];
  currentTransaction: PaymentTransaction | null;
  isProcessing: boolean;
}

type PaymentAction =
  | { type: 'START_PAYMENT'; payload: { booking: PaymentBooking; amount: PaymentAmount; paymentType: string } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'COMPLETE_PAYMENT'; payload: { transactionId: string; result: PaymentResult } }
  | { type: 'FAIL_PAYMENT'; payload: { transactionId: string; error: string } }
  | { type: 'CLEAR_CURRENT_TRANSACTION' }
  | { type: 'ADD_TRANSACTION'; payload: PaymentTransaction };

interface PaymentContextValue {
  state: PaymentContextState;
  startPayment: (booking: PaymentBooking, amount: PaymentAmount, paymentType: string) => string;
  completePayment: (transactionId: string, result: PaymentResult) => void;
  failPayment: (transactionId: string, error: string) => void;
  clearCurrentTransaction: () => void;
  getTransactionHistory: () => PaymentTransaction[];
  getCurrentTransaction: () => PaymentTransaction | null;
}

const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

const initialState: PaymentContextState = {
  transactions: [],
  currentTransaction: null,
  isProcessing: false
};

function paymentReducer(state: PaymentContextState, action: PaymentAction): PaymentContextState {
  switch (action.type) {
    case 'START_PAYMENT': {
      const transaction: PaymentTransaction = {
        id: generateTransactionId(),
        booking: action.payload.booking,
        amount: action.payload.amount,
        paymentType: action.payload.paymentType,
        status: 'pending',
        timestamp: new Date()
      };

      return {
        ...state,
        currentTransaction: transaction,
        transactions: [...state.transactions, transaction],
        isProcessing: false
      };
    }

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };

    case 'COMPLETE_PAYMENT': {
      const updatedTransactions = state.transactions.map(t =>
        t.id === action.payload.transactionId
          ? { ...t, status: 'completed' as const, result: action.payload.result }
          : t
      );

      return {
        ...state,
        transactions: updatedTransactions,
        currentTransaction: state.currentTransaction?.id === action.payload.transactionId
          ? { ...state.currentTransaction, status: 'completed', result: action.payload.result }
          : state.currentTransaction,
        isProcessing: false
      };
    }

    case 'FAIL_PAYMENT': {
      const updatedTransactions = state.transactions.map(t =>
        t.id === action.payload.transactionId
          ? { 
              ...t, 
              status: 'failed' as const, 
              result: { success: false, error: action.payload.error } 
            }
          : t
      );

      return {
        ...state,
        transactions: updatedTransactions,
        currentTransaction: state.currentTransaction?.id === action.payload.transactionId
          ? { 
              ...state.currentTransaction, 
              status: 'failed', 
              result: { success: false, error: action.payload.error } 
            }
          : state.currentTransaction,
        isProcessing: false
      };
    }

    case 'CLEAR_CURRENT_TRANSACTION':
      return {
        ...state,
        currentTransaction: null,
        isProcessing: false
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };

    default:
      return state;
  }
}

function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  const startPayment = (
    booking: PaymentBooking, 
    amount: PaymentAmount, 
    paymentType: string
  ): string => {
    dispatch({
      type: 'START_PAYMENT',
      payload: { booking, amount, paymentType }
    });
    return state.currentTransaction?.id || '';
  };

  const completePayment = (transactionId: string, result: PaymentResult) => {
    dispatch({
      type: 'COMPLETE_PAYMENT',
      payload: { transactionId, result }
    });
  };

  const failPayment = (transactionId: string, error: string) => {
    dispatch({
      type: 'FAIL_PAYMENT',
      payload: { transactionId, error }
    });
  };

  const clearCurrentTransaction = () => {
    dispatch({ type: 'CLEAR_CURRENT_TRANSACTION' });
  };

  const getTransactionHistory = (): PaymentTransaction[] => {
    return state.transactions.slice().reverse(); // Most recent first
  };

  const getCurrentTransaction = (): PaymentTransaction | null => {
    return state.currentTransaction;
  };

  const value: PaymentContextValue = {
    state,
    startPayment,
    completePayment,
    failPayment,
    clearCurrentTransaction,
    getTransactionHistory,
    getCurrentTransaction
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextValue => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
