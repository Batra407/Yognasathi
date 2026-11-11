/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the 'X-Powered-By: Next.js' header for security obfuscation
  poweredByHeader: false,

  // Enable gzip and brotli compression for production payloads
  compress: true,

  // Enable React strict mode for highlighting potential problems
  reactStrictMode: true,

  // Standalone output for ultra-lightweight Docker production containers
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

  // Enterprise Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
