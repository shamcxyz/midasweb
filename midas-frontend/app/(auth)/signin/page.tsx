"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:4999/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/groups');
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
    }
  };

  return (
    <section className="bg-white min-h-screen flex items-center">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
        <div className="py-12 md:py-20">
          <div className="pb-8 text-center">
            <h1 className="text-3xl font-semibold text-gray-800 md:text-4xl">
              Welcome back
            </h1>
          </div>
          {error && (
            <div className="mx-auto max-w-[400px] mb-4 text-red-500 text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mx-auto max-w-[400px] bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="space-y-4">
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Link
                  href="/reset-password"
                  className="mt-2 block text-sm text-blue-600 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <button
                type="submit"
                className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition duration-150"
              >
                Log in
              </button>
              <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition duration-150">
                Log in with SSO
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Let’s get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
