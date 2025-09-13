import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CvDownloadModal } from '@/components/CvDownloadModal'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'modalTitle': 'Download CV',
      'gdprTitle': 'Consent to personal data processing (GDPR)',
      'gdprText': 'I consent to the processing of my personal data for recruitment purposes...',
      'gdprConsent': 'I consent to the above conditions',
      'optionalFieldsTitle': 'Optional information',
      'optionalFieldsDescription': 'The following fields are optional...',
      'fullNameLabel': 'Full name',
      'fullNamePlaceholder': 'John Smith',
      'companyLabel': 'Company',
      'companyPlaceholder': 'Company name',
      'contactLabel': 'Contact',
      'contactPlaceholder': 'email@company.com',
      'justificationLabel': 'Justification',
      'justificationPlaceholder': 'Brief justification...',
      'downloadButton': 'Download CV',
      'downloading': 'Downloading...',
      'cancel': 'Cancel',
      'successTitle': 'CV downloaded!',
      'successMessage': 'Thank you for providing the information.',
      'errorTitle': 'An error occurred',
      'errorMessage': 'Failed to process CV download request.',
      'validationErrors.gdprRequired': 'You must consent to personal data processing'
    }
    return translations[key] || key
  }
}))

// Mock analytics hooks
jest.mock('@/lib/hooks/use-analytics-consent', () => ({
  useAnalyticsConsent: () => ({
    consent: { clarity: true, umami: true },
    isLoaded: true
  })
}))

// Mock client metrics
jest.mock('@/lib/metrics/client', () => ({
  getOrCreateClientId: (consentGiven: boolean) => ({
    clientId: consentGiven ? 'test-client-id-123' : undefined
  })
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

// Mock fetch
global.fetch = jest.fn()

describe('CvDownloadModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render modal when open', () => {
    render(
      <CvDownloadModal 
        isOpen={true} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    expect(screen.getByText('Download CV')).toBeInTheDocument()
    expect(screen.getByText('Consent to personal data processing (GDPR)')).toBeInTheDocument()
  })

  it('should not render modal when closed', () => {
    render(
      <CvDownloadModal 
        isOpen={false} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    expect(screen.queryByText('Download CV')).not.toBeInTheDocument()
  })

  it('should require GDPR consent to enable download button', async () => {
    const user = userEvent.setup()
    
    render(
      <CvDownloadModal 
        isOpen={true} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    const downloadButton = screen.getByRole('button', { name: /download cv/i })
    expect(downloadButton).toBeDisabled()

    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    expect(downloadButton).toBeEnabled()
  })

  it('should validate form and show errors', async () => {
    const user = userEvent.setup()
    
    render(
      <CvDownloadModal 
        isOpen={true} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    const downloadButton = screen.getByRole('button', { name: /download cv/i })
    await user.click(downloadButton)

    await waitFor(() => {
      expect(screen.getByText('You must consent to personal data processing')).toBeInTheDocument()
    })
  })

  it('should handle successful CV download', async () => {
    const user = userEvent.setup()
    
    // Mock DOM methods for file download
    const createElementSpy = jest.spyOn(document, 'createElement')
    const appendChildSpy = jest.spyOn(document.body, 'appendChild')
    const removeChildSpy = jest.spyOn(document.body, 'removeChild')
    const clickSpy = jest.fn()
    
    const mockLink = {
      href: '',
      download: '',
      click: clickSpy
    } as any
    
    createElementSpy.mockReturnValue(mockLink)
    appendChildSpy.mockImplementation(() => mockLink)
    removeChildSpy.mockImplementation(() => mockLink)
    
    render(
      <CvDownloadModal 
        isOpen={true} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    // Give consent
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    // Click download
    const downloadButton = screen.getByRole('button', { name: /download cv/i })
    await user.click(downloadButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cv-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"gdprConsent":true')
      })
      
      // Verify the payload contains session tracking information
      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);
      expect(payload).toMatchObject({
        gdprConsent: true,
        fullName: '',
        company: '',
        contact: '',
        justification: '',
        locale: 'en',
        clientId: 'test-client-id-123',
        analyticsConsent: { clarity: true, umami: true }
      });
      expect(payload.sessionId).toMatch(/^session-/);
    })

    await waitFor(() => {
      expect(screen.getByText('CV downloaded!')).toBeInTheDocument()
    })

    // Verify file download was triggered
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockLink.href).toBe('/cv/Piotr-Podgorski-CV-en.pdf')
    expect(mockLink.download).toBe('Piotr-Podgorski-CV-en.pdf')
    expect(clickSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('should handle API error', async () => {
    const user = userEvent.setup()
    
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500
    })
    
    render(
      <CvDownloadModal 
        isOpen={true} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    // Give consent
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    // Click download
    const downloadButton = screen.getByRole('button', { name: /download cv/i })
    await user.click(downloadButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
      expect(screen.getByText('Failed to process CV download request.')).toBeInTheDocument()
    })
  })

  it('should fill optional fields', async () => {
    const user = userEvent.setup()
    
    render(
      <CvDownloadModal 
        isOpen={true} 
        onClose={mockOnClose} 
        locale="en" 
      />
    )

    // Fill optional fields
    const fullNameInput = screen.getByPlaceholderText('John Smith')
    const companyInput = screen.getByPlaceholderText('Company name')
    const contactInput = screen.getByPlaceholderText('email@company.com')
    const justificationInput = screen.getByPlaceholderText('Brief justification...')

    await user.type(fullNameInput, 'John Doe')
    await user.type(companyInput, 'ACME Corp')
    await user.type(contactInput, 'john@acme.com')
    await user.type(justificationInput, 'Senior Developer position')

    expect(fullNameInput).toHaveValue('John Doe')
    expect(companyInput).toHaveValue('ACME Corp')
    expect(contactInput).toHaveValue('john@acme.com')
    expect(justificationInput).toHaveValue('Senior Developer position')
  })
})
