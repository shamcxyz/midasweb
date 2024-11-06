"use client";

import Link from "next/link";
import { useState } from "react";

export const metadata = {
  title: "Sign In - Open PRO",
  description: "Page description",
};

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Sign In submitted");
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Welcome Back</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          Sign In
        </button>

        <div className="mt-4 text-center">
          <Link href="/reset-password" className="text-sm text-blue-500 hover:underline">Forgot password?</Link>
        </div>

        <div className="flex items-center gap-3 text-center text-sm italic text-gray-600 mt-4 before:h-px before:flex-1 before:bg-gradient-to-r before:from-transparent before:via-gray-400/25 after:h-px after:flex-1 after:bg-gradient-to-r after:from-transparent after:via-gray-400/25">
          or
        </div>

        <button className="btn relative w-full mt-4 bg-gradient-to-b from-gray-800 to-gray-800/60 text-gray-300 py-2 rounded-md">
          Sign In with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-blue-500 hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </section>
  );
}
