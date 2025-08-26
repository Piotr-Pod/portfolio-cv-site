const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  env: {
    _next_intl_trailing_slash: 'false'
  },
  // Security configuration
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // Disable image optimization for security (if not needed)
  images: {
    unoptimized: false,
    domains: [], // Add your image domains here
  },
  // Headers configuration (additional to middleware)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
    ];
  },
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
