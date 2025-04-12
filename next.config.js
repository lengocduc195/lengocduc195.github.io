/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    // Tắt kiểm tra ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tắt kiểm tra TypeScript trong quá trình build
    ignoreBuildErrors: true,
  },
  // Loại bỏ các API route khỏi quá trình build
  webpack: (config, { isServer }) => {
    if (process.env.NEXT_PUBLIC_DISABLE_API === 'true') {
      // Loại bỏ các API route khỏi quá trình build
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
        };
      }
    }
    return config;
  },
};

module.exports = nextConfig;
