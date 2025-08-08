import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

export function Toaster() {
  // Simple static toaster that doesn't rely on useToast
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  );
}
