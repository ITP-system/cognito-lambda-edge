const nextConfig = {
  experimental: {
    taint: true,
    serverActions: {
      allowedOrigins: ['my-proxy.com', '*.my-proxy.com'],
    },
  },
};

module.exports = nextConfig;
