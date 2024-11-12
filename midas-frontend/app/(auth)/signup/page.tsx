"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const requestBody = {
      name,
      company,
      email,
      password,
      confirmPassword,
      isAdmin,
    };

    const response = await fetch("http://localhost:4999/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      alert("Account created successfully!");
      router.push("/signin");
    } else {
      const errorData = await response.json();
      alert(`Registration failed: ${errorData.message}`);
    }
  };

  return (
    <section className="bg-[#fdf7f5] text-gray-800 min-h-screen flex items-center">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-8 text-center">
            <h1 className="text-4xl font-semibold mb-4">Get Started Today</h1>
            <p className="text-gray-600 mb-8">Automate reimbursement requests in seconds.</p>
          </div>
          {/* Contact form */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-[400px] bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your full name"
                  required
                />
              </div>
              {/* Company Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="company">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your company name"
                  required
                />
              </div>
              {/* Email Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your work email"
                  required
                />
              </div>
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Password (at least 10 characters)"
                  required
                />
              </div>
              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {/* Admin Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Register as Admin
                </label>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="form-checkbox border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Yes, I want to register as an admin.
                </span>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-150"
              >
                Register
              </button>
              <div className="flex items-center gap-3 text-center text-sm italic text-gray-500 before:h-px before:flex-1 before:bg-gradient-to-r before:from-transparent before:via-gray-400/25 after:h-px after:flex-1 after:bg-gradient-to-r after:from-transparent after:via-gray-400/25">
                or
              </div>
              <button className="w-full py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition duration-150">
                Sign Up with Google
              </button>
            </div>
          </form>
          {/* Bottom link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}