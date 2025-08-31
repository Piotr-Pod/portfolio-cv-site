import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsManager } from '@/components/ui/analytics-manager';
import { AnalyticsConsentBanner } from '@/components/ui/analytics-consent-banner';
import { useAnalyticsConsent } from '@/lib/hooks/use-analytics-consent';

// Mock the analytics consent hook
jest.mock('@/lib/hooks/use-analytics-consent');

const mockUseAnalyticsConsent = useAnalyticsConsent as jest.MockedFunction<typeof useAnalyticsConsent>;

describe('Analytics Components', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('AnalyticsManager', () => {
    it('should render nothing when consent is not loaded', () => {
      mockUseAnalyticsConsent.mockReturnValue({
        consent: null,
        isLoaded: false,
        updateConsent: jest.fn(),
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      const { container } = render(
        <AnalyticsManager clarityProjectId="test-id" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render Clarity when consent is given', () => {
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: true, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: jest.fn(),
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      render(
        <AnalyticsManager clarityProjectId="test-clarity-id" />
      );

      // Clarity script should be added to document
      const clarityScript = document.querySelector('script[src*="clarity.ms"]');
      expect(clarityScript).toBeInTheDocument();
    });

    it('should not render Clarity when consent is not given', () => {
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: false, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: jest.fn(),
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      render(
        <AnalyticsManager clarityProjectId="test-clarity-id" />
      );

      const clarityScript = document.querySelector('script[src*="clarity.ms"]');
      expect(clarityScript).not.toBeInTheDocument();
    });

    it('should show banner for new users (no consent)', () => {
      mockUseAnalyticsConsent.mockReturnValue({
        consent: null,
        isLoaded: true,
        updateConsent: jest.fn(),
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      render(
        <AnalyticsManager clarityProjectId="test-clarity-id" />
      );

      expect(screen.getByText('Ustawienia analityki')).toBeInTheDocument();
    });
  });

  describe('AnalyticsConsentBanner', () => {
    it('should render consent banner with proper content', () => {
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: false, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: jest.fn(),
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      render(<AnalyticsConsentBanner />);

      expect(screen.getByText('Ustawienia analityki')).toBeInTheDocument();
      expect(screen.getByText(/Używamy plików cookie/)).toBeInTheDocument();
      expect(screen.getByText('Akceptuj wszystkie')).toBeInTheDocument();
      expect(screen.getByText('Odrzuć wszystkie')).toBeInTheDocument();
    });

    it('should show details when toggle button is clicked', async () => {
      const mockUpdateConsent = jest.fn();
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: false, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: mockUpdateConsent,
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      render(<AnalyticsConsentBanner />);

      const toggleButton = screen.getByText('Pokaż szczegóły');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Microsoft Clarity')).toBeInTheDocument();
        expect(screen.getByText('Plausible Analytics')).toBeInTheDocument();
      });
    });

    it('should call acceptAll when accept button is clicked', () => {
      const mockAcceptAll = jest.fn();
      const mockOnClose = jest.fn();
      
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: false, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: jest.fn(),
        acceptAll: mockAcceptAll,
        rejectAll: jest.fn(),
      });

      render(<AnalyticsConsentBanner onClose={mockOnClose} />);

      const acceptButton = screen.getByText('Akceptuj wszystkie');
      fireEvent.click(acceptButton);

      expect(mockAcceptAll).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call rejectAll when reject button is clicked', () => {
      const mockRejectAll = jest.fn();
      const mockOnClose = jest.fn();
      
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: false, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: jest.fn(),
        acceptAll: jest.fn(),
        rejectAll: mockRejectAll,
      });

      render(<AnalyticsConsentBanner onClose={mockOnClose} />);

      const rejectButton = screen.getByText('Odrzuć wszystkie');
      fireEvent.click(rejectButton);

      expect(mockRejectAll).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should update consent when individual toggles are changed', async () => {
      const mockUpdateConsent = jest.fn();
      mockUseAnalyticsConsent.mockReturnValue({
        consent: { clarity: false, plausible: false, umami: false },
        isLoaded: true,
        updateConsent: mockUpdateConsent,
        acceptAll: jest.fn(),
        rejectAll: jest.fn(),
      });

      render(<AnalyticsConsentBanner />);

      // Show details first
      const toggleButton = screen.getByText('Pokaż szczegóły');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const clarityToggle = checkboxes[0]; // First checkbox is Microsoft Clarity
        fireEvent.click(clarityToggle);
      });

      expect(mockUpdateConsent).toHaveBeenCalledWith({ clarity: true });
    });
  });
});
