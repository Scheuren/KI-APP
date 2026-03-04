import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Prevent access to sensitive browser APIs not needed by the app
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            // Prevent MIME-sniffing and restrict resource origins
            // Supabase URL must be allowed for API calls and auth
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // next.js requires 'unsafe-inline' for styles in dev; in prod this can be tightened with nonces
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Allow Supabase API + auth endpoints
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
              // next.js injects inline scripts; nonce-based CSP requires build changes, so unsafe-inline for now
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "img-src 'self' data: blob:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
