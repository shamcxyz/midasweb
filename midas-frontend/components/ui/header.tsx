"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="z-30 w-full bg-[#fefaf6]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between rounded-full bg-white shadow-md px-6">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-serif font-semibold text-gray-800">Midas</span>
          </div>
          {/* Navigation Buttons */}
          <ul className="flex items-center gap-6">
            <li>
              <Link
                href="/signin"
                className="text-sm font-medium text-gray-800 hover:text-gray-600 transition"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="text-sm font-medium text-gray-800 hover:text-gray-600 transition bg-gray-200 px-4 py-1.5 rounded-full"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
