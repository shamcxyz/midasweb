"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ReimbursementPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const [groupName, setGroupName] = useState("");
  const [reimbursementType, setReimbursementType] = useState("Uber");

  useEffect(() => {
    // Fetch group name
    const fetchGroupName = async () => {
      try {
        const response = await fetch(`http://localhost:4999/api/group/${groupId}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setGroupName(data.name);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    };

    if (groupId) {
      fetchGroupName();
    }
  }, [groupId]);

  const handleReimbursementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/upload?type=${encodeURIComponent(reimbursementType)}&groupId=${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9] flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full border border-gray-200">
        <h1 className="text-4xl font-serif font-semibold text-gray-800 text-center mb-8">
          Reimbursement Requests
        </h1>
        
        <form onSubmit={handleReimbursementSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Select Reimbursement Type
            </label>
            <select
              value={reimbursementType}
              onChange={(e) => setReimbursementType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a4e69] focus:border-[#4a4e69] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition duration-200"
            >
              <option value="Uber">Uber</option>
              <option value="Hotel">Hotel</option>
              <option value="Flight">Flight</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/groups')}
              className="flex-1 bg-[#f7ede9] text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-[#f5b8b8] transition duration-200 shadow-md"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#4a4e69] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2e2f3e] transition duration-200 shadow-md"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
