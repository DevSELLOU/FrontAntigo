const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true
      },
      // Screens absorbed by the management hub (`/company/:companyId/settings?tab=…`). Kept as
      // temporary redirects, not 404s, so old bookmarks and links still land on the right tab —
      // and `permanent: false` (307) leaves the door open to change our mind without browsers
      // having cached a 308 forever.
      {
        source: '/company/:companyId/categories',
        destination: '/company/:companyId/settings?tab=categorias',
        permanent: false
      },
      {
        source: '/company/:companyId/segments',
        destination: '/company/:companyId/settings?tab=segmentos',
        permanent: false
      },
      {
        source: '/company/:companyId/payment-conditions',
        destination: '/company/:companyId/settings?tab=condicoes-pagamento',
        permanent: false
      },
      {
        source: '/company/:companyId/payment-methods',
        destination: '/company/:companyId/settings?tab=metodos-pagamento',
        permanent: false
      },
      {
        source: '/company/:companyId/users',
        destination: '/company/:companyId/settings?tab=usuarios',
        permanent: false
      },
      {
        source: '/company/:companyId/orders-setup',
        destination: '/company/:companyId/settings?tab=pedidos',
        permanent: false
      }
    ]
  },
  images: {
    // The object key is immutable (it carries a `${Date.now()}-` prefix), but the URL the API hands
    // out is not: photos are served as presigned GET URLs, so the signature is part of the cache
    // key. The backend now reuses one signature per object for 80% of its hour, which is what makes
    // caching work at all; past that the URL rotates and any older entry is dead weight. An hour
    // matches that window — 30 days only piled up entries that could never be requested again.
    minimumCacheTTL: 3600, // 1 hour, matching the presigned URL reuse window
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.wasabisys.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.wasabisys.com',
        port: '',
        pathname: '/**',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' ${apiBaseUrl} https://s3.wasabisys.com; frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://drive.google.com; object-src 'none'`
          }
        ]
      }
    ]
  }
}

export default nextConfig
