import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
          sizeClasses[size],
        )}
      />
    </div>
  );
}

export function LoadingSpinnerOverlay({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className,
      )}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-card p-6 rounded-lg shadow-lg"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Loading...
        </p>
      </motion.div>
    </motion.div>
  );
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("bg-card rounded-lg border p-6", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
      </div>
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
        animate={{ x: ["calc(-100%)", "calc(100%)"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{ opacity: 0.7 }}
      />
    </motion.div>
  );
}
