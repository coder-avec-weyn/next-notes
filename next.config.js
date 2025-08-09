/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  transpilePackages: ["styled-jsx"],
  // Ensure proper module resolution
  webpack: (config, { isServer }) => {
    // Fix for potential path resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Fix module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      "client-only": require.resolve("client-only"),
    };

    // Ensure proper handling of Next.js internal modules
    config.resolve.modules = [
      "node_modules",
      ...(config.resolve.modules || []),
    ];

    // Fix Babel loader path issues
    config.module.rules.forEach((rule) => {
      if (rule.use && Array.isArray(rule.use)) {
        rule.use.forEach((useItem) => {
          if (useItem.loader && useItem.loader.includes("babel-loader")) {
            useItem.options = {
              ...useItem.options,
              cacheDirectory: true,
            };
          }
        });
      }
    });

    return config;
  },
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig["experimental"] = {
    // NextJS 13.4.8 up to 14.1.3:
    // swcPlugins: [[require.resolve("tempo-devtools/swc/0.86"), {}]],
    // NextJS 14.1.3 to 14.2.11:
    swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]],

    // NextJS 15+ (Not yet supported, coming soon)
  };
}

// Add transpilePackages for framer-motion
if (!nextConfig.transpilePackages) {
  nextConfig.transpilePackages = [];
}
if (!nextConfig.transpilePackages.includes("framer-motion")) {
  nextConfig.transpilePackages.push("framer-motion");
}

module.exports = nextConfig;
