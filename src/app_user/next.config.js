const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["d26twmkq685jo5.cloudfront.net"],
    },
  },
};

module.exports = nextConfig;