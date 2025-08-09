import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { InstallPrompt } from "@/components/install-prompt";

export const metadata: Metadata = {
  title: "NotesApp - Your Personal Notes",
  description: "A modern notes application with offline support",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NotesApp",
    // Add iOS specific meta tags for better PWA experience
    startupImage: [
      {
        url: "/icons/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1536-2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      // Add more common device sizes
      {
        url: "/icons/apple-splash-1242-2688.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-828-1792.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      // Landscape orientations
      {
        url: "/icons/apple-splash-2732-2048.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/icons/apple-splash-2388-1668.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/icons/apple-splash-2048-1536.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5, // Allow zooming for better accessibility
    minimumScale: 1,
    userScalable: true,
  },
  // Add Apple touch icon for iOS home screen
  icons: {
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-icon-120.png", sizes: "120x120", type: "image/png" },
    ],
    shortcut: [
      {
        url: "/icons/shortcut-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="NotesApp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="NotesApp" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
        <Script id="register-sw" strategy="beforeInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
                  function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                    
                    // Check for updates to the service worker
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      console.log('Service Worker update found!', newWorker);
                      
                      // Track progress
                      newWorker.addEventListener('statechange', () => {
                        console.log('Service Worker state changed:', newWorker.state);
                      });
                    });
                  },
                  function(err) {
                    console.error('Service Worker registration failed: ', err);
                  }
                );
                
                // Handle service worker updates
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  if (refreshing) return;
                  refreshing = true;
                  console.log('Controller changed, refreshing page to use updated service worker');
                  window.location.reload();
                });
              });
            } else {
              console.warn('Service workers are not supported in this browser');
            }
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
          <Toaster />
          <InstallPrompt />
        </ThemeProvider>
        <TempoInit />
      </body>
    </html>
  );
}
