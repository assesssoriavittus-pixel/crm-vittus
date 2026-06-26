/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/crm-vittus',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
