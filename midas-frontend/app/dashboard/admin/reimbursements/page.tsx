"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Reimbursement {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ReimbursementsPage() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReimbursements = async () => {
      try {
        const response = await fetch("http://localhost:4999/api/admin/reimbursements", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setReimbursements(data.reimbursements);
        } else {
          throw new Error("Failed to fetch reimbursements");
        }
      } catch (error) {
        console.error("Error fetching reimbursements:", error);
        setError("Failed to load reimbursements");
      } finally {
        setLoading(false);
      }
    };

    fetchReimbursements();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Reimbursement Requests</h1>
          <Link
            href="/dashboard/admin"
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : reimbursements.length === 0 ? (
            <div className="text-center text-gray-700 py-8">No reimbursement requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">User</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Amount</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Description</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reimbursements.map((reimbursement) => (
                    <tr key={reimbursement.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-800">{reimbursement.userName}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-medium text-gray-900">
                          ${reimbursement.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-800">{reimbursement.description}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${reimbursement.status === 'approved' ? 'bg-green-100 text-green-800' :
                            reimbursement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {reimbursement.status.charAt(0).toUpperCase() + reimbursement.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-800">
                        {new Date(reimbursement.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 