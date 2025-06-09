/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@coinbase/agentkit',
      '@langchain/openai',
      '@langchain/core',
      '@langchain/langgraph',
      'viem',
      'bs58',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore problematic modules that aren't needed for our use case
      config.externals.push({
        '@privy-io/server-auth': 'commonjs @privy-io/server-auth',
      });

      // Handle dynamic requires in @hpke modules
      config.module.rules.push({
        test: /\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: 'require\\(',
            replace: '(false && require)(',
            flags: 'g',
          },
        },
        include: [
          /node_modules\/@hpke/,
          /node_modules\/@privy-io/,
        ],
      });
    }
    return config;
  },
};

module.exports = nextConfig;
