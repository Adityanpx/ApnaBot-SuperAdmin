// next.config.js — REPLACE ENTIRE FILE

/** @type {import('next').NextConfig} */
const nextConfig = {

  // Enable React strict mode — catches bugs early
  reactStrictMode: true,

  // Image optimization — add any domains your backend uses for images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary (used by backend for shop images)
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  // Silence noisy hydration warnings in development
  // caused by browser extensions modifying the DOM
  // Remove this for production debugging
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
  }),

  // Compress responses
  compress: true,

  // Generate unique build ID for cache busting
  generateBuildId: async () => {
    return `apnabot-admin-${Date.now()}`;
  },
};

module.exports = nextConfig;
