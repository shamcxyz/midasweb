"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      router.push("/signin"); // Redirect to login page if not logged in
    } else {
      setUser(JSON.parse(loggedInUser)); // Parse and set user data
    }
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
            Logged in as: <span className="font-semibold">{user}</span>
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("loggedInUser"); // Clear session
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
