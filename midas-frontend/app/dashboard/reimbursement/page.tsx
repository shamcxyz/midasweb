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
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/groups')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200 shadow-md"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200 shadow-md"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 