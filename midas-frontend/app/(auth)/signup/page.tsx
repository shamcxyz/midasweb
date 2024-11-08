// signup.tsx

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
  const [adminCode, setAdminCode] = useState("");
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

    if (isAdmin) {
      if (!adminCode) {
        alert("Admin code is required for admin registration.");
        return;
      }
      requestBody.adminCode = adminCode;
    }

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
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center">
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              Create an account
            </h1>
          </div>
          {/* Contact form */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-[400px]">
            <div className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input w-full"
                  placeholder="Your full name"
                  required
                />
              </div>
              {/* Company Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65" htmlFor="company">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="form-input w-full"
                  placeholder="Your company name"
                  required
                />
              </div>
              {/* Email Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65" htmlFor="email">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input w-full"
                  placeholder="Your work email"
                  required
                />
              </div>
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-indigo-200/65" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full"
                  placeholder="Password (at least 10 characters)"
                  required
                />
              </div>
              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-indigo-200/65" htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input w-full"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {/* Admin Selection */}
              <div>
                <label className="block text-sm font-medium text-indigo-200/65">
                  Register as Admin
                </label>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-indigo-200/65">
                  Yes, I want to register as an admin.
                </span>
              </div>
              {/* Admin Code Input */}
              {isAdmin && (
                <div>
                  <label
                    className="block text-sm font-medium text-indigo-200/65"
                    htmlFor="adminCode"
                  >
                    Admin Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="form-input w-full"
                    placeholder="Enter the admin code"
                    required
                  />
                </div>
              )}
            </div>
            <div className="mt-6 space-y-5">
              <button
                type="submit"
                className="btn w-full bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-bottom text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:bg-[length:100%_150%]"
              >
                Register
              </button>
              <div className="flex items-center gap-3 text-center text-sm italic text-gray-600 before:h-px before:flex-1 before:bg-gradient-to-r before:from-transparent before:via-gray-400/25 after:h-px after:flex-1 after:bg-gradient-to-r after:from-transparent after:via-gray-400/25">
                or
              </div>
              <button className="btn relative w-full bg-gradient-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-bottom text-gray-300 hover:bg-[length:100%_150%]">
                Sign Up with Google
              </button>
            </div>
          </form>
          {/* Bottom link */}
          <div className="mt-6 text-center text-sm text-indigo-200/65">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
