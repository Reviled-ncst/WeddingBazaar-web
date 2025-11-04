import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingRequestModal } from '../BookingRequestModal';
import type { Service } from '../../types';

// Mock dependencies
vi.mock('../../../shared/contexts/HybridAuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1-2025-001',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+639171234567',
      role: 'individual'
    }
  })
}));

vi.mock('../../../services/availabilityService', () => ({
  availabilityService: {
    checkAvailability: vi.fn().mockResolvedValue({
      isAvailable: true,
      reason: null
    })
  }
}));

vi.mock('../../../services/api/optimizedBookingApiService', () => ({
  optimizedBookingApiService: {
    createBookingRequest: vi.fn().mockResolvedValue({
      id: 'test-booking-123',
      booking_id: 'test-booking-123',
      status: 'request'
    })
  }
}));

vi.mock('../BookingSuccessModal', () => ({
  BookingSuccessModal: ({ isOpen, bookingData, onClose }: any) => (
    isOpen ? (
      <div data-testid="success-modal">
        <h2>Booking Success</h2>
        <p data-testid="booking-id">{bookingData.id}</p>
        <p data-testid="service-name">{bookingData.serviceName}</p>
        <p data-testid="vendor-name">{bookingData.vendorName}</p>
        <p data-testid="event-date">{bookingData.eventDate}</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}));

vi.mock('../../../components/calendar/VisualCalendar', () => ({
  VisualCalendar: ({ onDateSelect, selectedDate }: any) => (
    <div data-testid="visual-calendar">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateSelect(e.target.value)}
        data-testid="date-picker"
      />
    </div>
  )
}));

vi.mock('../../../shared/components/forms/LocationPicker', () => ({
  LocationPicker: ({ value, onChange }: any) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="location-picker"
      placeholder="Search location"
    />
  )
}));

describe('BookingRequestModal - Comprehensive Data Flow Tests', () => {
  const mockService: Service = {
    id: 'service-123',
    vendorId: 'vendor-456',
    name: 'Premium Photography Package',
    vendorName: 'Elite Studios',
    category: 'Photography',
    description: 'Professional wedding photography',
    price: 50000,
    rating: 4.8,
    reviewCount: 120
  };

  const mockOnClose = vi.fn();
  const mockOnBookingCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Step 1: Date Selection - Required Field', () => {
    it('should show date picker on step 1', () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
          onBookingCreated={mockOnBookingCreated}
        />
      );

      expect(screen.getByTestId('visual-calendar')).toBeInTheDocument();
      expect(screen.getByText('📅 When is your event?')).toBeInTheDocument();
    });

    it('should show validation error when date is not selected', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Event date is required')).toBeInTheDocument();
      });
    });

    it('should clear error and proceed when valid date is selected', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Try to proceed without date
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Event date is required')).toBeInTheDocument();
      });

      // Select date
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });

      // Error should be cleared and should proceed to step 2
      await waitFor(() => {
        expect(screen.queryByText('Event date is required')).not.toBeInTheDocument();
      });

      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('📍 Where will it be?')).toBeInTheDocument();
      });
    });

    it('should store date data correctly', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });

      expect(datePicker).toHaveValue('2025-12-25');
    });
  });

  describe('Step 2: Location Selection - Required Field', () => {
    it('should show location picker on step 2', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Complete step 1
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('location-picker')).toBeInTheDocument();
        expect(screen.getByText('📍 Where will it be?')).toBeInTheDocument();
      });
    });

    it('should show validation error when location is not entered', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 2
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByTestId('location-picker')).toBeInTheDocument();
      });

      // Try to proceed without location
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Location is required')).toBeInTheDocument();
      });
    });

    it('should store location data correctly', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 2
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila, Philippines' } });
        expect(locationPicker).toHaveValue('Manila, Philippines');
      });
    });
  });

  describe('Step 3: Event Details - Guest Count (Required)', () => {
    it('should show guest count field on step 3', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 3
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('⏰ Event Details')).toBeInTheDocument();
        expect(screen.getByLabelText(/Number of Guests/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum guest count', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 3
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '0' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid number/i)).toBeInTheDocument();
      });
    });

    it('should show estimated quote when guest count is entered', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 3
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Estimated Total:/i)).toBeInTheDocument();
        // Photography: 15000 base + (150 * 100) = 30000, +12% tax = 33600
        expect(screen.getByText(/₱33,600\.00/)).toBeInTheDocument();
      });
    });

    it('should allow optional time field', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 3
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const timeInput = screen.getByLabelText(/Event Time/i);
        expect(timeInput).toBeInTheDocument();
        fireEvent.change(timeInput, { target: { value: '14:00' } });
        expect(timeInput).toHaveValue('14:00');
      });
    });
  });

  describe('Step 4: Budget Range - Required Field', () => {
    it('should show budget selection on step 4', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 4
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('💰 Budget & Requirements')).toBeInTheDocument();
        expect(screen.getByLabelText(/Budget Range/i)).toBeInTheDocument();
      });
    });

    it('should validate budget selection', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 4
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Budget Range/i)).toBeInTheDocument();
      });

      // Try to proceed without selecting budget
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Budget range is required')).toBeInTheDocument();
      });
    });
  });

  describe('Step 5: Contact Information - Required Fields', () => {
    it('should show contact fields on step 5', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate through all steps to step 5
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const budgetSelect = screen.getByLabelText(/Budget Range/i);
        fireEvent.change(budgetSelect, { target: { value: '₱50,000-₱100,000' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('📞 Contact Information')).toBeInTheDocument();
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      });
    });

    it('should pre-fill user data from auth context', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 5
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const budgetSelect = screen.getByLabelText(/Budget Range/i);
        fireEvent.change(budgetSelect, { target: { value: '₱50,000-₱100,000' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Full Name/i);
        const phoneInput = screen.getByLabelText(/Phone Number/i);
        const emailInput = screen.getByLabelText(/Email Address/i);

        expect(nameInput).toHaveValue('John Doe');
        expect(phoneInput).toHaveValue('+639171234567');
        expect(emailInput).toHaveValue('test@example.com');
      });
    });

    it('should validate required contact fields', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to step 5
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const budgetSelect = screen.getByLabelText(/Budget Range/i);
        fireEvent.change(budgetSelect, { target: { value: '₱50,000-₱100,000' } });
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Full Name/i);
        const phoneInput = screen.getByLabelText(/Phone Number/i);
        
        // Clear pre-filled values
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.change(phoneInput, { target: { value: '' } });
      });

      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /Submit Request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Data Flow - End to End', () => {
    it('should successfully submit booking with all data and show success modal immediately', async () => {
      const user = userEvent.setup();
      
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
          onBookingCreated={mockOnBookingCreated}
        />
      );

      // Step 1: Select date
      const datePicker = screen.getByTestId('date-picker');
      await user.clear(datePicker);
      await user.type(datePicker, '2025-12-25');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: Enter location
      await waitFor(() => {
        expect(screen.getByTestId('location-picker')).toBeInTheDocument();
      });
      const locationPicker = screen.getByTestId('location-picker');
      await user.clear(locationPicker);
      await user.type(locationPicker, 'Manila, Philippines');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3: Enter guest count and time
      await waitFor(() => {
        expect(screen.getByLabelText(/Number of Guests/i)).toBeInTheDocument();
      });
      const guestInput = screen.getByLabelText(/Number of Guests/i);
      await user.clear(guestInput);
      await user.type(guestInput, '100');
      
      const timeInput = screen.getByLabelText(/Event Time/i);
      await user.type(timeInput, '14:00');
      
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 4: Select budget
      await waitFor(() => {
        expect(screen.getByLabelText(/Budget Range/i)).toBeInTheDocument();
      });
      const budgetSelect = screen.getByLabelText(/Budget Range/i);
      await user.selectOptions(budgetSelect, '₱50,000-₱100,000');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 5: Contact info (pre-filled, just submit)
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Submit Request/i });
      await user.click(submitButton);

      // Success modal should appear immediately
      await waitFor(() => {
        expect(screen.getByTestId('success-modal')).toBeInTheDocument();
        expect(screen.getByText('Booking Success')).toBeInTheDocument();
        expect(screen.getByTestId('booking-id')).toHaveTextContent('test-booking-123');
        expect(screen.getByTestId('service-name')).toHaveTextContent('Premium Photography Package');
        expect(screen.getByTestId('vendor-name')).toHaveTextContent('Elite Studios');
        expect(screen.getByTestId('event-date')).toHaveTextContent('2025-12-25');
      });

      // Verify callback was called
      expect(mockOnBookingCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-booking-123',
          booking_id: 'test-booking-123',
          status: 'request'
        })
      );
    });

    it('should preserve all data when navigating back and forth', async () => {
      const user = userEvent.setup();
      
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Fill step 1
      const datePicker = screen.getByTestId('date-picker');
      await user.type(datePicker, '2025-12-25');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Fill step 2
      await waitFor(() => {
        expect(screen.getByTestId('location-picker')).toBeInTheDocument();
      });
      const locationPicker = screen.getByTestId('location-picker');
      await user.type(locationPicker, 'Manila');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Go back to step 1
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /← Back/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /← Back/i }));

      // Verify date is still filled
      await waitFor(() => {
        const datePickerAgain = screen.getByTestId('date-picker');
        expect(datePickerAgain).toHaveValue('2025-12-25');
      });

      // Go forward again
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Verify location is still filled
      await waitFor(() => {
        const locationPickerAgain = screen.getByTestId('location-picker');
        expect(locationPickerAgain).toHaveValue('Manila');
      });
    });
  });

  describe('Progress Indicator', () => {
    it('should show correct progress percentage as form is filled', async () => {
      render(
        <BookingRequestModal
          service={mockService}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Initially 0%
      expect(screen.getByText('0%')).toBeInTheDocument();

      // Fill step 1 - 20%
      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2025-12-25' } });
      
      await waitFor(() => {
        expect(screen.getByText('20%')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      // Fill step 2 - 40%
      await waitFor(() => {
        const locationPicker = screen.getByTestId('location-picker');
        fireEvent.change(locationPicker, { target: { value: 'Manila' } });
      });

      await waitFor(() => {
        expect(screen.getByText('40%')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      // Fill step 3 - 60%
      await waitFor(() => {
        const guestInput = screen.getByLabelText(/Number of Guests/i);
        fireEvent.change(guestInput, { target: { value: '100' } });
      });

      await waitFor(() => {
        expect(screen.getByText('60%')).toBeInTheDocument();
      });
    });
  });
});
