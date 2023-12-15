const nextConfig = {
  basePath: "/admin",
  experimental: {
    serverActions: {
      allowedOrigins: ["my-proxy.com", "*.my-proxy.com"],
    },
  },
};

module.exports = nextConfig;
