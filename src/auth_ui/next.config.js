/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/auth",
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.CLOUD_FRONT_DOMAIN],
    },
  },
};

module.exports = nextConfig;
