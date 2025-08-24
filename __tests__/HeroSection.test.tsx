import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroSection } from '@/components/HeroSection'

describe('HeroSection - Download CV Button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render download CV button', () => {
    render(<HeroSection />)
    
    const downloadButton = screen.getByRole('button', { name: /downloadcv/i })
    expect(downloadButton).toBeInTheDocument()
  })

  it('should call handleDownloadCV when clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const downloadButton = screen.getByRole('button', { name: /downloadcv/i })
    await user.click(downloadButton)
    
    // Check if console.log was called (from handleDownloadCV)
    expect(console.log).toHaveBeenCalledWith('Download CV clicked')
  })

  it('should show popup notification when clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const downloadButton = screen.getByRole('button', { name: /downloadcv/i })
    await user.click(downloadButton)
    
    // Check if popup appears
    const popup = screen.getByText('CV zostało pobrane!')
    expect(popup).toBeInTheDocument()
  })
})
