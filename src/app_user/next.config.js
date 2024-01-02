const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.CLOUD_FRONT_DOMAIN],
    },
  },
};

module.exports = nextConfig;
