// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [reimbursementType, setReimbursementType] = useState("Uber");
  const router = useRouter();

  const handleReimbursementSubmit = async (e) => {
    e.preventDefault();
    router.push(`/dashboard/upload?type=${encodeURIComponent(reimbursementType)}`);
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Reimbursement Requests
        </h1>
        <form onSubmit={handleReimbursementSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Select Reimbursement Type
            </label>
            <select
              value={reimbursementType}
              onChange={(e) => setReimbursementType(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <option value="Uber">Uber</option>
              <option value="Hotel">Hotel</option>
              <option value="Flight">Flight</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200 shadow-md"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
