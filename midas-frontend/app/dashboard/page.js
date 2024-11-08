"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from backend
    async function fetchUserProfile() {
      try {
        const response = await fetch("http://localhost:4999/api/profile", {
          credentials: "include", // Include cookies in the request
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Not authenticated, redirect to signin
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Redirect to signin on error
        router.push("/signin");
      }
    }

    fetchUserProfile();
  }, []);

  if (!user) {
    return null; // Optionally, add a loading spinner here
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-700 text-center">
          Here is a summary of your account details and activity.
        </p>
        <div className="mt-6">
          <p className="text-gray-600 text-sm">
            Name: <span className="font-semibold">{user.name}</span>
          </p>
          <p className="text-gray-600 text-sm">
            Email: <span className="font-semibold">{user.email}</span>
          </p>
          <p className="text-gray-600 text-sm">
            Company: <span className="font-semibold">{user.company}</span>
          </p>

          {/* Admin-specific content */}
          {user.isAdmin && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                Admin Panel
              </h2>
              <p className="text-gray-700">
                You have administrative privileges.
              </p>
              {/* Add admin-specific components or links here */}
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="mt-4 btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Admin Dashboard
              </button>
            </div>
          )}

          <button
            onClick={async () => {
              // Call backend to logout
              await fetch("http://localhost:4999/api/logout", {
                method: "POST",
                credentials: "include",
              });
              setUser(null);
              router.push("/signin"); // Redirect to login on logout
            }}
            className="mt-6 btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
