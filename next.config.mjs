/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  webpack: (config, { isServer }) => {
    // --- CLIENT SIDE FIX ---
    // Prevent playwright-core & chromium from being bundled in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "playwright-core": false,
        "@sparticuz/chromium": false,
      }
    }

    // --- SERVER SIDE FIX ---
    // Let Next.js treat playwright-core & @sparticuz/chromium as externals
    // Required so Vercel loads them at runtime, not during build
    if (isServer) {
      config.externals.push("playwright-core", "@sparticuz/chromium")
    }

    return config
  },
}

export default nextConfig
