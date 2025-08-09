/** @type {import('next').NextConfig} */
let withPWA;
let nextConfig;

try {
  withPWA = require("next-pwa")({
    dest: "public",
    register: false, // We're handling registration manually in layout.tsx
    skipWaiting: true,
    disable: false, // Enable in development for testing
    // Enhanced caching strategy
    runtimeCaching: [
      {
        // Cache static assets
        urlPattern:
          /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // Cache API responses
        urlPattern: /^https:\/\/.*\/api\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        // Cache Supabase API responses
        urlPattern: new RegExp(process.env.NEXT_PUBLIC_SUPABASE_URL + ".*"),
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
      {
        // Cache page navigations
        urlPattern: /\/dashboard\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "page-cache",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // Cache other pages
        urlPattern: /\/(?!api\/|_next\/|_proxy\/|_static\/|_vercel\/)/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // Cache Google Fonts stylesheets
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
        },
      },
      {
        // Cache Google Fonts webfonts
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
    ],
  });
} catch (error) {
  console.warn(
    "next-pwa not found, PWA features will be disabled:",
    error.message,
  );
  withPWA = (config) => config;
}

// Environment variables for API keys should be set in your hosting platform
// For local development, create a .env.local file with:
// GEMINI_API_KEY=your_api_key_here

nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  transpilePackages: ["styled-jsx"],
  // Ensure environment variables are properly exposed
  env: {
    // The GEMINI_API_KEY will be automatically included from your environment
    // Do not hardcode API keys here - use the environment variables input in Tempo
  },
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

// Ensure framer-motion is properly handled in client components
nextConfig.experimental = {
  ...nextConfig.experimental,
  esmExternals: "loose",
};

module.exports = withPWA(nextConfig);
