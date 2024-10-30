/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images : {
    remotePatterns : [
      {
        protocol : 'https',
        hostname : 'i.ytimg.com',
        pathname : '/vi/**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https://www.youtube.com https://i.ytimg.com;
              font-src 'self' data:;
              connect-src 'self' ${process.env.CHROME_EXTENSION_ORIGIN};
              frame-src 'self' https://www.youtube.com;
              media-src 'self' https://www.youtube.com;
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CHROME_EXTENSION_ORIGIN
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
        ]
      }
    ];
  },
};

export default nextConfig;