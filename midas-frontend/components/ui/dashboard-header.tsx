"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4999/api/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/signin"; 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="z-30 w-full bg-[#fefaf6]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between rounded-full bg-white shadow-md px-6">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-serif font-semibold text-gray-800">Midas</span>
          </div>
          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/history"
              className="p-2 text-gray-800 hover:text-gray-600 transition"
            >
              History
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-800 hover:text-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}