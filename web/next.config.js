/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },

  reactStrictMode: true,
  experimental: {
    newNextLinkBehavior: true,
    images: {
      allowFutureImage: true,
      unoptimized: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    loader: "imgix",
    path: "/",
  }
}

module.exports = nextConfig
