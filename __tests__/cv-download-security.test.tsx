/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/cv-download/route';

// Mock environment variables
process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'test@example.com';
process.env.RESEND_API_KEY = 'test-key';
process.env.RESEND_FROM_EMAIL = 'noreply@test.com';

// Mock fetch for email sending
global.fetch = jest.fn();

describe('CV Download API Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"id": "test"}'),
    });
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/cv-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Test Browser',
      },
      body: JSON.stringify(body),
    });
  };

  const validPayload = {
    gdprConsent: true,
    fullName: 'John Doe',
    company: 'Test Company',
    contact: 'john@test.com',
    justification: 'Looking for developers',
    locale: 'en',
    clientId: 'test-client-id',
    sessionId: 'test-session-id',
    analyticsConsent: { clarity: false, umami: false },
  };

  describe('XSS Protection', () => {
    test('should sanitize script tags in fullName', async () => {
      const maliciousPayload = {
        ...validPayload,
        fullName: '<script>alert("XSS")</script>John Doe',
      };

      const request = createRequest(maliciousPayload);
      const response = await POST(request);

      if (response.status !== 200) {
        const errorBody = await response.json();
        console.error('API Error:', response.status, errorBody);
      }

      expect(response.status).toBe(200);
      
      // Check that fetch was called with sanitized content
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      expect(emailBody.html).not.toContain('<script>');
      expect(emailBody.html).not.toContain('alert("XSS")');
      expect(emailBody.html).toContain('John Doe');
    });

    test('should sanitize HTML injection in company field', async () => {
      const maliciousPayload = {
        ...validPayload,
        company: '<img src=x onerror=alert("hack")>Evil Corp',
      };

      const request = createRequest(maliciousPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      expect(emailBody.html).not.toContain('<img');
      expect(emailBody.html).not.toContain('onerror=');
      expect(emailBody.html).toContain('Evil Corp');
    });

    test('should sanitize malicious links in contact field', async () => {
      const maliciousPayload = {
        ...validPayload,
        contact: '<a href="javascript:alert(1)">Click me</a>',
      };

      const request = createRequest(maliciousPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      expect(emailBody.html).not.toContain('javascript:');
      expect(emailBody.html).not.toContain('<a href');
      expect(emailBody.html).toContain('Click me');
    });

    test('should sanitize complex XSS in justification field', async () => {
      const maliciousPayload = {
        ...validPayload,
        justification: `
          <iframe src="javascript:alert('XSS')"></iframe>
          <style>body{background:url('javascript:alert(1)')}</style>
          Normal text here
        `,
      };

      const request = createRequest(maliciousPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      expect(emailBody.html).not.toContain('<iframe');
      expect(emailBody.html).not.toContain('<style>');
      expect(emailBody.html).not.toContain('javascript:');
      expect(emailBody.html).toContain('Normal text here');
    });
  });

  describe('Suspicious Content Detection', () => {
    test('should log suspicious content without blocking request', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const suspiciousPayload = {
        ...validPayload,
        fullName: '<script>evil()</script>',
        company: '<iframe src="bad.com"></iframe>',
      };

      const request = createRequest(suspiciousPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Suspicious content detected in CV download request:',
        expect.objectContaining({
          suspiciousFields: ['fullName', 'company'],
          clientIp: '192.168.1.1',
          userAgent: 'Test Browser',
        })
      );

      consoleSpy.mockRestore();
    });

    test('should not log when content is clean', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const request = createRequest(validPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('HTML Escaping', () => {
    test('should escape special HTML characters', async () => {
      const payloadWithSpecialChars = {
        ...validPayload,
        fullName: 'John & Jane <Doe>',
        company: 'Test "Company" & Co.',
        contact: "john's email",
        justification: 'Looking for <developers> & "designers"',
      };

      const request = createRequest(payloadWithSpecialChars);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      
      expect(emailBody.html).toContain('&amp;');
      expect(emailBody.html).toContain('&lt;');
      expect(emailBody.html).toContain('&gt;');
      expect(emailBody.html).toContain('&quot;');
      expect(emailBody.html).toContain('&#039;');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty fields safely', async () => {
      const emptyFieldsPayload = {
        gdprConsent: true,
        locale: 'en',
        clientId: 'test-client-id',
        sessionId: 'test-session-id',
        analyticsConsent: { clarity: false, umami: false },
      };

      const request = createRequest(emptyFieldsPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      expect(emailBody.html).toContain('Not provided');
    });

    test('should handle very long malicious content', async () => {
      const longMaliciousContent = '<script>' + 'a'.repeat(1000) + '</script>';
      
      const payloadWithLongContent = {
        ...validPayload,
        justification: longMaliciousContent,
      };

      const request = createRequest(payloadWithLongContent);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      expect(emailBody.html).not.toContain('<script>');
    });
  });

  describe('Content Preservation', () => {
    test('should preserve legitimate content while removing malicious parts', async () => {
      const mixedPayload = {
        ...validPayload,
        fullName: 'John <script>alert(1)</script> Doe',
        company: 'Legitimate Company <img src=x onerror=hack()>',
        justification: 'We are looking for <developers> with experience in <React> and <Node.js>',
      };

      const request = createRequest(mixedPayload);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const emailBody = JSON.parse(fetchCall[1].body);
      
      // Should preserve legitimate content
      expect(emailBody.html).toContain('John');
      expect(emailBody.html).toContain('Doe');
      expect(emailBody.html).toContain('Legitimate Company');
      expect(emailBody.html).toContain('developers');
      expect(emailBody.html).toContain('React');
      expect(emailBody.html).toContain('Node.js');
      
      // Should remove malicious content
      expect(emailBody.html).not.toContain('<script>');
      expect(emailBody.html).not.toContain('alert(1)');
      expect(emailBody.html).not.toContain('onerror=');
    });
  });
});
