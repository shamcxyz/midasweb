"use client";

import DashboardHeader from "@/components/ui/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9]">
      <DashboardHeader />
      <main className="px-8 pt-2"> {/* Reduced top padding */}
        {children}
      </main>
    </div>
  );
}
