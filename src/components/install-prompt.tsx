"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Plus } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

interface InstallPromptProps {
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  className?: string;
  showAsButton?: boolean;
}

export function InstallPrompt({
  buttonVariant = "default",
  className = "",
  showAsButton = false,
}: InstallPromptProps = {}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false); // Initially hidden until beforeinstallprompt fires
  const [isMobile, setIsMobile] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const checkInstallStatus = () => {
      const isAppInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        // @ts-ignore: Safari specific property
        window.navigator.standalone === true;

      setIsStandalone(isAppInstalled);

      // Hide floating button if app is installed
      if (isAppInstalled) {
        setShowFloatingButton(false);
      }
    };

    // Detect if using mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|webos|iphone|ipad|ipod|blackberry|IEMobile|Opera Mini/i.test(
        userAgent,
      );
    };

    // Detect if using Safari
    const checkSafari = () => {
      const userAgent = navigator.userAgent;
      return /^((?!chrome|android).)*safari/i.test(userAgent);
    };

    // Run initial checks
    checkInstallStatus();
    setIsMobile(checkMobile());
    setIsSafari(checkSafari());

    // This is the critical event handler for PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      console.log("Captured beforeinstallprompt event");

      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show our custom install prompt after a delay if not explicitly showing as button
      if (!showAsButton) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds
      }

      // Mark as installable and show the floating button
      setIsInstallable(true);
      setShowFloatingButton(true);

      // Force the browser to show the install prompt in the address bar
      // by triggering user interaction
      document.addEventListener(
        "click",
        function promptOnUserInteraction() {
          // Remove this listener after first interaction
          document.removeEventListener("click", promptOnUserInteraction);
          // Don't trigger the prompt immediately, wait a moment
          setTimeout(() => {
            // This doesn't actually show the prompt, but ensures the browser
            // knows the user has interacted with the page
            console.log(
              "User interaction detected, browser may show install prompt",
            );
          }, 300);
        },
        { once: true },
      );
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("App was installed");
      setIsStandalone(true);
      setShowFloatingButton(false);
      setDeferredPrompt(null);

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50";
      notification.innerHTML = "NotesApp successfully installed!";
      document.body.appendChild(notification);

      // Remove notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      checkInstallStatus();
    };

    // Add all event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", handleDisplayModeChange);

    // If it's Safari on iOS, we can't capture the beforeinstallprompt event
    // So we'll show instructions for manual installation
    if (checkSafari() && checkMobile() && !isStandalone) {
      setIsInstallable(true);
      setShowFloatingButton(true);
    }

    // Check if the app meets PWA criteria
    const checkPWACriteria = async () => {
      try {
        // Check if service worker is registered
        const swRegistration = await navigator.serviceWorker.getRegistration();
        if (swRegistration) {
          console.log("Service worker is registered", swRegistration);
          // Only show the floating button for Safari or if beforeinstallprompt hasn't fired yet
          if ((checkSafari() && checkMobile()) || deferredPrompt) {
            setShowFloatingButton(true);
          }
        } else {
          console.warn("Service worker not registered");
        }
      } catch (error) {
        console.error("Error checking service worker:", error);
      }
    };

    // Run the check
    checkPWACriteria();

    return () => {
      // Clean up all event listeners
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", handleDisplayModeChange);
    };
  }, [showAsButton, deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Log before showing prompt
        console.log("Triggering install prompt...");

        // Show the browser's install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          setIsStandalone(true);
          setShowFloatingButton(false);
          // Show success message
          alert(
            "Installation started! Look for NotesApp on your home screen or app drawer.",
          );
        } else {
          console.log("User dismissed the install prompt");
          // Keep the button visible for future attempts
          setShowFloatingButton(true);
        }
      } catch (error) {
        console.error("Error showing install prompt:", error);
        alert(
          "There was an error starting the installation. Please try again.",
        );
      } finally {
        // Clear the saved prompt as it can't be used again
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else if (isSafari && isMobile) {
      // Show Safari-specific instructions
      setShowPrompt(true);
    } else {
      // Fallback: Show generic installation instructions with more details
      alert(
        "To install this app:\n\n" +
          "• On Chrome/Edge: Look for the install icon (+) in the address bar\n" +
          "• On Firefox: Use the 'Install' option in the menu\n" +
          "• On Safari (iOS): Tap Share → Add to Home Screen\n" +
          "• On Safari (macOS): File → Add to Dock\n\n" +
          "Note: If you don't see the install option, you may already have the app installed or your browser may not support PWA installation.",
      );
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Don't hide the floating button so users can trigger installation later
  };

  if (isStandalone) return null;

  // If showing as explicit button, always show it
  if (showAsButton) {
    return (
      <Button
        onClick={handleInstallClick}
        variant={buttonVariant}
        className={`gap-2 ${className}`}
        disabled={isStandalone}
      >
        <Download size={16} />
        {isStandalone ? "App Installed" : "Install App"}
      </Button>
    );
  }

  return (
    <>
      {/* Main install prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Install NotesApp
              </h3>
              {isSafari && isMobile ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-2">
                  <p>To install on iOS Safari:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Tap the share icon{" "}
                      <span className="inline-block w-5 h-5 text-center border rounded">
                        ↑
                      </span>{" "}
                      at the bottom of your screen
                    </li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" in the top right corner</li>
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Install this app on your device for quick access and offline
                  use.
                </p>
              )}
              <div className="mt-3 flex space-x-2">
                {!isSafari && (
                  <Button
                    onClick={handleInstallClick}
                    variant="default"
                    className="gap-2"
                  >
                    <Download size={16} />
                    Install App
                  </Button>
                )}
                <Button onClick={dismissPrompt} variant="outline">
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Floating install button - Only visible after beforeinstallprompt fires or on Safari */}
      {showFloatingButton && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 left-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg z-40 hover:opacity-90 transition-all animate-pulse touch-area min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="Install app"
          style={{ touchAction: "manipulation" }}
        >
          <Download size={24} />
          {isInstallable && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
      )}
    </>
  );
}
