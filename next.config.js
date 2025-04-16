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
  // Cấu hình Turbopack
  turbopack: {
    // Cấu hình Turbopack cho Next.js 15.3.0
    resolveAlias: {
      // Ví dụ: '@/components': './src/components'
    },
    // Không sử dụng cấu hình webpack khi dùng Turbopack
    // Để tránh cảnh báo "Webpack is configured while Turbopack is not"
    // Turbopack sẽ tự động xử lý các tài nguyên mà không cần cấu hình thêm
  },
};

module.exports = nextConfig;
