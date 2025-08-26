# Security Documentation

## Overview
This document outlines the security measures implemented in the CV Portfolio application.

## Security Headers
The application implements the following security headers via middleware:

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-XSS-Protection**: `1; mode=block` - Enables XSS protection
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()` - Restricts browser features
- **Content-Security-Policy**: Comprehensive CSP to prevent XSS and other attacks
- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload` - Enforces HTTPS

## API Security

### Rate Limiting
- **Contact Form**: 5 requests per minute per IP address
- **Implementation**: In-memory rate limiting (use Redis for production)

### CSRF Protection
- **Token Generation**: Cryptographically secure random tokens
- **Validation**: Server-side token validation
- **Origin Checking**: Validates request origin

### Input Validation
- **Schema**: Zod validation for all API inputs
- **Sanitization**: Automatic input sanitization
- **Length Limits**: Enforced character limits on all fields

## Environment Variables
Never commit sensitive information to version control:

```bash
# Required for production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
RESEND_API_KEY=your_api_key
CSRF_SECRET=your_secret
SESSION_SECRET=your_secret

# Optional
REDIS_URL=your_redis_url
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Dependencies
- **Regular Updates**: Keep all dependencies updated
- **Security Audits**: Run `npm audit` regularly
- **Vulnerability Monitoring**: Monitor for known vulnerabilities

## Production Checklist

### Before Deployment
- [ ] Update all dependencies to latest versions
- [ ] Run `npm audit` and fix any vulnerabilities
- [ ] Set up proper environment variables
- [ ] Configure HTTPS (automatic on Vercel)
- [ ] Set up monitoring and logging
- [ ] Test rate limiting and CSRF protection

### Ongoing Security
- [ ] Monitor application logs for suspicious activity
- [ ] Regularly update dependencies
- [ ] Review and update security headers as needed
- [ ] Monitor for new security vulnerabilities
- [ ] Keep backup and recovery procedures updated

## Reporting Security Issues
If you discover a security vulnerability, please report it privately to the maintainers.

## Security Best Practices
1. **Never expose sensitive data in client-side code**
2. **Always validate and sanitize user input**
3. **Use HTTPS in production**
4. **Implement proper error handling**
5. **Log security events**
6. **Regular security audits**
7. **Keep dependencies updated**
