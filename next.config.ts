/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production"

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://pvixtqqcegfbxkhxogww.supabase.co;
  font-src 'self' data:;
  connect-src 'self' https://pvixtqqcegfbxkhxogww.supabase.co ${isDev ? "ws://localhost:* ws:" : ""};
  frame-src 'self' https://www.youtube.com https://youtube.com;
  media-src 'self' blob:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim()

const nextConfig = {
  allowedDevOrigins: ['3000-firebase-farmer-kamolgit-1781445602919.cluster-edb2jv34dnhjisxuq5m7l37ccy.cloudworkstations.dev'],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pvixtqqcegfbxkhxogww.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};
export default nextConfig;