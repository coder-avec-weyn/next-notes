import DashboardNavbar from "@/components/dashboard-navbar";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}
