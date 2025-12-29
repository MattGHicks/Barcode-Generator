/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore pdfkit's font files in webpack processing
      config.externals = config.externals || [];
      config.externals.push({
        'pdfkit': 'commonjs pdfkit',
      });
    }

    // Handle .afm font files
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    return config;
  },
};

module.exports = nextConfig;
