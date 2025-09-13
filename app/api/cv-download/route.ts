import { NextResponse } from "next/server";
import { CvDownloadSchema } from "@/lib/validators/cv-download";
import { headers } from "next/headers";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Configure DOMPurify for Node.js environment
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// HTML sanitization function for email content
function sanitizeForEmail(input: string): string {
  // Remove all HTML tags and escape special characters
  const sanitized = purify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Additional escape for any remaining special characters
  return sanitized.replace(/[&<>"']/g, (char) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[char];
  });
}

// Function to detect potentially malicious content
function detectSuspiciousContent(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<style/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Function to get detailed information about detected threats
function getDetectedThreats(input: string): string[] {
  const threats = [
    { pattern: /<script/i, description: 'Script tags (potential XSS)' },
    { pattern: /javascript:/i, description: 'JavaScript URIs' },
    { pattern: /data:/i, description: 'Data URIs (potential code execution)' },
    { pattern: /vbscript:/i, description: 'VBScript URIs' },
    { pattern: /onload=/i, description: 'onload event handlers' },
    { pattern: /onerror=/i, description: 'onerror event handlers' },
    { pattern: /onclick=/i, description: 'onclick event handlers' },
    { pattern: /onmouseover=/i, description: 'onmouseover event handlers' },
    { pattern: /<iframe/i, description: 'iframe elements (potential embedding)' },
    { pattern: /<object/i, description: 'object elements' },
    { pattern: /<embed/i, description: 'embed elements' },
    { pattern: /<link/i, description: 'link elements (potential external resources)' },
    { pattern: /<meta/i, description: 'meta elements' },
    { pattern: /<style/i, description: 'style elements (potential CSS injection)' }
  ];
  
  return threats
    .filter(threat => threat.pattern.test(input))
    .map(threat => threat.description);
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { 
          error: { 
            code: "INVALID_JSON", 
            message: "Invalid JSON payload" 
          } 
        },
        { status: 400 }
      );
    }

    // Validate request data
    const parsed = CvDownloadSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: { 
            code: "VALIDATION_ERROR", 
            message: "Invalid payload", 
            details: parsed.error.flatten() 
          } 
        },
        { status: 400 }
      );
    }

    const { gdprConsent, fullName, company, contact, justification, clientId, sessionId, analyticsConsent } = parsed.data;

    // Get client information for logging
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const xForwardedFor = headersList.get('x-forwarded-for');
    const xRealIp = headersList.get('x-real-ip');
    const clientIp = xForwardedFor?.split(',')[0]?.trim() || xRealIp || 'Unknown';

    // Check for suspicious content and collect detailed threat information
    const suspiciousFields = [];
    const detectedThreats = new Set<string>();
    
    if (fullName && detectSuspiciousContent(fullName)) {
      suspiciousFields.push('fullName');
      getDetectedThreats(fullName).forEach(threat => detectedThreats.add(threat));
    }
    if (company && detectSuspiciousContent(company)) {
      suspiciousFields.push('company');
      getDetectedThreats(company).forEach(threat => detectedThreats.add(threat));
    }
    if (contact && detectSuspiciousContent(contact)) {
      suspiciousFields.push('contact');
      getDetectedThreats(contact).forEach(threat => detectedThreats.add(threat));
    }
    if (justification && detectSuspiciousContent(justification)) {
      suspiciousFields.push('justification');
      getDetectedThreats(justification).forEach(threat => detectedThreats.add(threat));
    }

    if (suspiciousFields.length > 0) {
      console.warn('Suspicious content detected in CV download request:', {
        clientIp,
        suspiciousFields,
        detectedThreats: Array.from(detectedThreats),
        timestamp: new Date().toISOString(),
        userAgent,
        contentSamples: {
          fullName: fullName?.substring(0, 50) + (fullName && fullName.length > 50 ? '...' : ''),
          company: company?.substring(0, 50) + (company && company.length > 50 ? '...' : ''),
          contact: contact?.substring(0, 50) + (contact && contact.length > 50 ? '...' : ''),
          justification: justification?.substring(0, 100) + (justification && justification.length > 100 ? '...' : ''),
        },
        securityAction: 'All malicious content sanitized and neutralized'
      });
    }

    // Check required environment variables
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    if (!contactEmail) {
      console.error("NEXT_PUBLIC_CONTACT_EMAIL not configured");
      return NextResponse.json(
        { 
          error: { 
            code: "CONFIGURATION_ERROR", 
            message: "Contact email not configured" 
          } 
        },
        { status: 500 }
      );
    }

    
    // Get current timestamp and format it nicely
    const now = new Date();
    const timestamp = now.toISOString();
    const localTime = now.toLocaleString('pl-PL', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const locale = body.locale || 'pl';

    // Determine analytics services used
    const analyticsServices = [];
    if (analyticsConsent?.clarity) analyticsServices.push('Microsoft Clarity');
    if (analyticsConsent?.umami) analyticsServices.push('Umami Analytics');
    const analyticsStatus = analyticsServices.length > 0 
      ? `Enabled: ${analyticsServices.join(', ')}` 
      : 'No analytics consent given';

    // Prepare email content with enhanced tracking information
    const emailSubject = `🔔 CV Download Request - ${localTime}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            📄 CV Download Request
          </h2>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">⏰ Request Details</h3>
            <p><strong>Download Time:</strong> ${localTime} (Warsaw Time)</p>
            <p><strong>UTC Timestamp:</strong> ${timestamp}</p>
            <p><strong>Site Language:</strong> ${locale.toUpperCase()}</p>
            <p><strong>IP Address:</strong> ${clientIp}</p>
            <p><strong>User Agent:</strong> ${userAgent}</p>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">🔒 Session & Privacy Information</h3>
            <p><strong>GDPR Consent:</strong> <span style="color: #059669; font-weight: bold;">${gdprConsent ? '✅ YES' : '❌ NO'}</span></p>
            <p><strong>Analytics Tracking:</strong> ${analyticsStatus}</p>
            ${clientId ? `<p><strong>Client ID:</strong> <code style="background: #d1fae5; padding: 2px 6px; border-radius: 4px;">${clientId}</code></p>` : '<p><strong>Client ID:</strong> <em>No analytics consent - anonymous session</em></p>'}
            ${sessionId ? `<p><strong>Session ID:</strong> <code style="background: #d1fae5; padding: 2px 6px; border-radius: 4px;">${sessionId}</code></p>` : ''}
          </div>

          ${suspiciousFields.length > 0 ? `
          <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ Security Alert - Malicious Content Detected & Neutralized</h3>
            <p style="color: #7f1d1d; margin-bottom: 10px;"><strong>IMPORTANT:</strong> The system detected potentially malicious code in the submitted form. All dangerous content has been automatically sanitized and rendered completely harmless.</p>
            
            <div style="background: #fee2e2; padding: 10px; border-radius: 4px; margin: 10px 0;">
              <p style="color: #991b1b; font-weight: bold; margin: 0 0 5px 0;">📍 Affected fields: ${suspiciousFields.join(', ')}</p>
              <p style="color: #991b1b; font-weight: bold; margin: 5px 0;">🛡️ Detected threats:</p>
              <ul style="color: #7f1d1d; margin: 5px 0 5px 20px; padding: 0;">
                ${Array.from(detectedThreats).map(threat => `<li style="margin: 2px 0;">${threat}</li>`).join('')}
              </ul>
              <p style="color: #7f1d1d; font-size: 12px; margin: 10px 0 0 0;"><em>⚡ Action taken: All HTML tags, JavaScript code, event handlers, and suspicious patterns have been completely removed or escaped. The content below is 100% safe to read and cannot execute any code.</em></p>
            </div>
            
            <div style="background: #dcfce7; padding: 8px; border-radius: 4px; margin: 10px 0; border-left: 3px solid #16a34a;">
              <p style="color: #15803d; font-size: 12px; margin: 0;"><strong>✅ Security Status:</strong> All malicious content has been neutralized. You can safely review the sanitized information below without any risk of code execution or security compromise.</p>
            </div>
            
            <p style="color: #7f1d1d; font-size: 12px; margin: 5px 0 0 0;"><strong>Recommendation:</strong> Review the sanitized content below. If this was a legitimate submission with formatting, the person may need to resubmit as plain text. If this appears to be a deliberate attack, consider implementing additional security measures or blocking the IP address.</p>
          </div>
          ` : ''}

          <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1d4ed8; margin-top: 0;">👤 Recruiter Information</h3>
            ${fullName ? `<p><strong>Full Name:</strong> ${sanitizeForEmail(fullName)}</p>` : '<p><strong>Full Name:</strong> <em>Not provided</em></p>'}
            ${company ? `<p><strong>Company:</strong> ${sanitizeForEmail(company)}</p>` : '<p><strong>Company:</strong> <em>Not provided</em></p>'}
            ${contact ? `<p><strong>Contact:</strong> ${sanitizeForEmail(contact)}</p>` : '<p><strong>Contact:</strong> <em>Not provided</em></p>'}
            ${justification ? `<p><strong>Justification:</strong></p><div style="background: white; padding: 10px; border-left: 4px solid #3b82f6; margin-top: 5px;">${sanitizeForEmail(justification).replace(/\n/g, '<br>')}</div>` : '<p><strong>Justification:</strong> <em>Not provided</em></p>'}
          </div>

          <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>🤖 This email was automatically generated from CV download request</p>
            <p>📧 Sent to: ${contactEmail}</p>
            <p>🔐 All data is processed according to GDPR compliance</p>
          </div>
        </div>
      </div>
    `;

    // Send email notification
    let emailSent = false;
    
    // Try Resend first
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `CV Download <${process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev'}>`,
            to: [contactEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          console.log('CV download notification sent via Resend');
        } else {
          const errorText = await resendResponse.text();
          console.error('Resend API error:', errorText);
        }
      } catch (error) {
        console.error('Resend error:', error);
      }
    }

    // Fallback to Mailgun if Resend failed
    if (!emailSent && process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      try {
        const mailgunAuth = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64');
        
        const formData = new FormData();
        formData.append('from', `CV Download <noreply@${process.env.MAILGUN_DOMAIN}>`);
        formData.append('to', contactEmail);
        formData.append('subject', emailSubject);
        formData.append('html', emailHtml);

        const mailgunResponse = await fetch(
          `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${mailgunAuth}`,
            },
            body: formData,
          }
        );

        if (mailgunResponse.ok) {
          emailSent = true;
          console.log('CV download notification sent via Mailgun');
        } else {
          const errorText = await mailgunResponse.text();
          console.error('Mailgun API error:', errorText);
        }
      } catch (error) {
        console.error('Mailgun error:', error);
      }
    }

    if (!emailSent) {
      console.error('Failed to send CV download notification email');
      return NextResponse.json(
        { 
          error: { 
            code: "EMAIL_SEND_ERROR", 
            message: "Failed to send notification email" 
          } 
        },
        { status: 500 }
      );
    }

    // Log successful download with enhanced tracking information
    console.log(`CV download request: ${JSON.stringify({
      timestamp,
      localTime,
      locale,
      clientIp,
      userAgent,
      clientId: clientId || 'anonymous',
      sessionId: sessionId || 'none',
      analyticsConsent: analyticsServices.length > 0 ? analyticsServices : 'none',
      recruiterInfo: {
        fullName: fullName || 'Not provided',
        company: company || 'Not provided',
        contact: contact || 'Not provided',
        justification: justification ? 'Provided' : 'Not provided'
      }
    }, null, 2)}`);

    return NextResponse.json({ 
      success: true,
      message: "CV download request processed successfully" 
    });

  } catch (error) {
    console.error('CV download API error:', error);
    return NextResponse.json(
      { 
        error: { 
          code: "INTERNAL_ERROR", 
          message: "Internal server error" 
        } 
      },
      { status: 500 }
    );
  }
}
