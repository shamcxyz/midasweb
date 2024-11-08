// app/dashboard/layout.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch("http://localhost:4999/api/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/signin");
      }
    }

    fetchUserProfile();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}