import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroSection } from '@/components/HeroSection'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Piotr Podgórski',
      'subtitle': 'Senior Java Developer | AI Enthusiast',
      'description': 'For 8 years I\'ve been building scalable systems...',
      'downloadCv': 'Download CV',
      'contact': 'Contact',
      'scroll': 'Scroll'
    }
    return translations[key] || key
  }
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

// Mock the CvDownloadModal component
jest.mock('@/components/CvDownloadModal', () => ({
  CvDownloadModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="cv-download-modal">CV Download Modal</div> : null
}))

describe('HeroSection - Download CV Button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render download CV button', () => {
    render(<HeroSection />)
    
    const downloadButton = screen.getByRole('button', { name: /download cv/i })
    expect(downloadButton).toBeInTheDocument()
  })

  it('should open CV download modal when clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const downloadButton = screen.getByRole('button', { name: /download cv/i })
    await user.click(downloadButton)
    
    // Check if modal appears
    const modal = screen.getByTestId('cv-download-modal')
    expect(modal).toBeInTheDocument()
  })
})
