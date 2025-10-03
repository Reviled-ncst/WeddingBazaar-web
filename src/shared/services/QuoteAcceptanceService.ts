/**
 * Quote Acceptance Storage Utility
 * Manages accepted quotes in localStorage for persistence across sessions
 */

const ACCEPTED_QUOTES_KEY = 'weddingbazaar_accepted_quotes';

export interface AcceptedQuote {
  bookingId: string;
  acceptedAt: string;
  notes?: string;
}

export class QuoteAcceptanceService {
  
  /**
   * Mark a quote as accepted
   */
  static acceptQuote(bookingId: string, notes?: string): void {
    const acceptedQuotes = this.getAcceptedQuotes();
    const acceptedQuote: AcceptedQuote = {
      bookingId: bookingId.toString(),
      acceptedAt: new Date().toISOString(),
      notes: notes || 'Quote accepted by couple'
    };
    
    // Remove existing entry if any
    const filteredQuotes = acceptedQuotes.filter(q => q.bookingId !== bookingId.toString());
    filteredQuotes.push(acceptedQuote);
    
    localStorage.setItem(ACCEPTED_QUOTES_KEY, JSON.stringify(filteredQuotes));
    
    console.log('✅ [QuoteAcceptance] Quote accepted and stored:', acceptedQuote);
  }
  
  /**
   * Check if a quote is accepted
   */
  static isQuoteAccepted(bookingId: string): boolean {
    const acceptedQuotes = this.getAcceptedQuotes();
    return acceptedQuotes.some(q => q.bookingId === bookingId.toString());
  }
  
  /**
   * Get acceptance info for a quote
   */
  static getAcceptanceInfo(bookingId: string): AcceptedQuote | null {
    const acceptedQuotes = this.getAcceptedQuotes();
    return acceptedQuotes.find(q => q.bookingId === bookingId.toString()) || null;
  }
  
  /**
   * Get all accepted quotes
   */
  static getAcceptedQuotes(): AcceptedQuote[] {
    try {
      const stored = localStorage.getItem(ACCEPTED_QUOTES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('⚠️ [QuoteAcceptance] Error reading accepted quotes from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Remove acceptance for a quote
   */
  static removeAcceptance(bookingId: string): void {
    const acceptedQuotes = this.getAcceptedQuotes();
    const filteredQuotes = acceptedQuotes.filter(q => q.bookingId !== bookingId.toString());
    localStorage.setItem(ACCEPTED_QUOTES_KEY, JSON.stringify(filteredQuotes));
    
    console.log('🗑️ [QuoteAcceptance] Quote acceptance removed for booking:', bookingId);
  }
  
  /**
   * Clear all accepted quotes
   */
  static clearAll(): void {
    localStorage.removeItem(ACCEPTED_QUOTES_KEY);
    console.log('🗑️ [QuoteAcceptance] All accepted quotes cleared');
  }
  
  /**
   * Get enhanced status for display
   */
  static getDisplayStatus(booking: { id: string; status: string }): string {
    if (booking.status === 'quote_sent' && this.isQuoteAccepted(booking.id)) {
      return 'quote_accepted';
    }
    return booking.status;
  }
}
