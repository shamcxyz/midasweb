"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';

interface Reimbursement {
  _id: string;
  userEmail: string;
  adminEmail: string;
  reimbursementDetails: {
    type: string;
    amount: string;
    documentType: string;
    details: string;
  };
  receiptPath: string;
  status: string;
  feedback: string;
  groupId: string;
  createdAt: string;
  s3Urls: string[];
}

// Add this helper function to parse the reimbursement details
const parseReimbursementDetails = (details: string) => {
  try {
    return JSON.parse(details);
  } catch (e) {
    return details;
  }
};

interface ExpandedRows {
  [key: string]: boolean;
}

export default function ReimbursementsPage() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Type</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Amount</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Details</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Actions</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reimbursements.map((reimbursement) => {
                    const details = typeof reimbursement.reimbursementDetails === 'string'
                      ? parseReimbursementDetails(reimbursement.reimbursementDetails)
                      : reimbursement.reimbursementDetails;
                    
                    return (
                      <>
                        <tr key={reimbursement._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-800">{reimbursement.userEmail}</td>
                          <td className="py-4 px-4 text-gray-800">{details.type}</td>
                          <td className="py-4 px-4">
                            <span className="font-mono font-medium text-gray-900">
                              ${details.amount}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-800">{details.details}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${reimbursement.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                reimbursement.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                              {reimbursement.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => toggleRowExpansion(reimbursement._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a4e69] transition-all duration-200"
                            >
                              {expandedRows[reimbursement._id] ? (
                                <>
                                  <span>Hide Details</span>
                                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <span>View Details</span>
                                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {new Date(reimbursement.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                        {expandedRows[reimbursement._id] && (
                          <tr>
                            <td colSpan={7} className="bg-gray-50 px-8 py-6">
                              <div className="max-w-3xl">
                                <div className="mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
                                  <div className="bg-white rounded-lg border border-gray-200 p-4 text-black">
                                    {reimbursement.feedback ? (
                                      <div className="prose prose-sm max-w-none [&>*]:text-black">
                                        <ReactMarkdown>{reimbursement.feedback}</ReactMarkdown>
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 italic">No feedback provided</p>
                                    )}
                                  </div>
                                </div>
                                {reimbursement.s3Urls && reimbursement.s3Urls[0] && (
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt</h3>
                                    <a
                                      href={reimbursement.s3Urls[0]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-[#4a4e69] hover:text-[#4a4e69]/80"
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      View Receipt
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 