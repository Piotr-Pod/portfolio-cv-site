import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { parseAssistantResponse, ParsedResponse } from '@/lib/chat/response-parser';

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

describe('Response Parser', () => {
  describe('parseAssistantResponse', () => {
    it('should parse plain text', () => {
      const result = parseAssistantResponse('Hello world');
      expect(result).toEqual([
        { type: 'text', content: 'Hello world' }
      ]);
    });

    it('should parse HTTP links', () => {
      const result = parseAssistantResponse('Visit http://example.com for more info');
      expect(result).toEqual([
        { type: 'text', content: 'Visit ' },
        { type: 'link', content: 'http://example.com', href: 'http://example.com' },
        { type: 'text', content: ' for more info' }
      ]);
    });

    it('should parse HTTPS links', () => {
      const result = parseAssistantResponse('Check https://secure.example.com');
      expect(result).toEqual([
        { type: 'text', content: 'Check ' },
        { type: 'link', content: 'https://secure.example.com', href: 'https://secure.example.com' }
      ]);
    });

    it('should parse email addresses', () => {
      const result = parseAssistantResponse('Contact me at john@example.com');
      expect(result).toEqual([
        { type: 'text', content: 'Contact me at ' },
        { type: 'email', content: 'john@example.com', href: 'mailto:john@example.com' }
      ]);
    });

    it('should parse complex email addresses', () => {
      const result = parseAssistantResponse('Email: user.name+tag@domain.co.uk');
      expect(result).toEqual([
        { type: 'text', content: 'Email: ' },
        { type: 'email', content: 'user.name+tag@domain.co.uk', href: 'mailto:user.name+tag@domain.co.uk' }
      ]);
    });

    it('should parse bold text', () => {
      const result = parseAssistantResponse('This is **bold text** here');
      expect(result).toEqual([
        { type: 'text', content: 'This is ' },
        { type: 'bold', content: 'bold text' },
        { type: 'text', content: ' here' }
      ]);
    });

    it('should parse contact section button', () => {
      const result = parseAssistantResponse('Click {contactSection} to contact me');
      expect(result).toEqual([
        { type: 'text', content: 'Click ' },
        { type: 'button', content: '{contactSection}', action: expect.any(Function) },
        { type: 'text', content: ' to contact me' }
      ]);
    });

    it('should parse hero section button', () => {
      const result = parseAssistantResponse('Go to {heroSection} for more info');
      expect(result).toEqual([
        { type: 'text', content: 'Go to ' },
        { type: 'button', content: '{heroSection}', action: expect.any(Function) },
        { type: 'text', content: ' for more info' }
      ]);
    });

    it('should parse complex mixed content', () => {
      const result = parseAssistantResponse('Visit **https://example.com** or click {contactSection} for help');
      expect(result).toEqual([
        { type: 'text', content: 'Visit ' },
        { type: 'bold', content: 'https://example.com' },
        { type: 'text', content: ' or click ' },
        { type: 'button', content: '{contactSection}', action: expect.any(Function) },
        { type: 'text', content: ' for help' }
      ]);
    });

    it('should parse mixed content with email and links', () => {
      const result = parseAssistantResponse('Email me at contact@example.com or visit https://example.com');
      expect(result).toEqual([
        { type: 'text', content: 'Email me at ' },
        { type: 'email', content: 'contact@example.com', href: 'mailto:contact@example.com' },
        { type: 'text', content: ' or visit ' },
        { type: 'link', content: 'https://example.com', href: 'https://example.com' }
      ]);
    });

    it('should handle multiple bold sections', () => {
      const result = parseAssistantResponse('**First** and **Second** bold text');
      expect(result).toEqual([
        { type: 'bold', content: 'First' },
        { type: 'text', content: ' and ' },
        { type: 'bold', content: 'Second' },
        { type: 'text', content: ' bold text' }
      ]);
    });

    it('should handle empty string', () => {
      const result = parseAssistantResponse('');
      expect(result).toEqual([]);
    });
  });

  describe('ParsedResponse component', () => {
    it('should render plain text', () => {
      render(<ParsedResponse text="Hello world" locale="pl" />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should render links as clickable elements', () => {
      render(<ParsedResponse text="Visit http://example.com" locale="pl" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'http://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render email addresses as mailto links', () => {
      render(<ParsedResponse text="Contact john@example.com" locale="pl" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'mailto:john@example.com');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });

    it('should render bold text with strong tag', () => {
      render(<ParsedResponse text="This is **bold text**" locale="pl" />);
      const boldElement = screen.getByText('bold text');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render contact section button in Polish', () => {
      render(<ParsedResponse text="Click {contactSection}" locale="pl" />);
      const button = screen.getByRole('button', { name: 'Kontakt' });
      expect(button).toBeInTheDocument();
    });

    it('should render contact section button in English', () => {
      render(<ParsedResponse text="Click {contactSection}" locale="en" />);
      const button = screen.getByRole('button', { name: 'Contact' });
      expect(button).toBeInTheDocument();
    });

    it('should render hero section button in Polish', () => {
      render(<ParsedResponse text="Go to {heroSection}" locale="pl" />);
      const button = screen.getByRole('button', { name: 'Strona główna' });
      expect(button).toBeInTheDocument();
    });

    it('should render hero section button in English', () => {
      render(<ParsedResponse text="Go to {heroSection}" locale="en" />);
      const button = screen.getByRole('button', { name: 'Home' });
      expect(button).toBeInTheDocument();
    });

    it('should handle button clicks when on home page', () => {
      // Mock getElementById - element exists (we're on home page)
      const mockContactElement = {
        scrollIntoView: jest.fn()
      };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockContactElement as any);

      render(<ParsedResponse text="Click {contactSection}" locale="pl" />);
      const button = screen.getByRole('button', { name: 'Kontakt' });
      
      fireEvent.click(button);
      
      expect(document.getElementById).toHaveBeenCalledWith('contact');
      expect(mockContactElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should navigate to home page when element not found', () => {
      // Mock getElementById - element doesn't exist (we're not on home page)
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      // Mock window.location
      const mockLocation = {
        pathname: '/pl/blog',
        href: ''
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });

      render(<ParsedResponse text="Click {contactSection}" locale="pl" />);
      const button = screen.getByRole('button', { name: 'Kontakt' });
      
      fireEvent.click(button);
      
      expect(mockLocation.href).toBe('/pl#contact');
    });

    it('should handle hero section navigation', () => {
      // Mock getElementById - element doesn't exist (we're not on home page)
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      // Mock window.location
      const mockLocation = {
        pathname: '/en/blog',
        href: ''
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });

      render(<ParsedResponse text="Go to {heroSection}" locale="en" />);
      const button = screen.getByRole('button', { name: 'Home' });
      
      fireEvent.click(button);
      
      expect(mockLocation.href).toBe('/en#hero');
    });
  });
});
