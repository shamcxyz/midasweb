"use client";
import DashboardLayout from "@/app/dashboard/layouts/layout";
import { useState, useEffect } from "react";
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  joinCode: string;
  createdAt: string;
}

interface AdminInfo {
  company: string;
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toISOString().split('T')[0];
  } catch {
    return 'N/A';
  }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAdminInfo, setLoadingAdminInfo] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch("http://localhost:4999/api/admin/info", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setAdminInfo(data);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      } finally {
        setLoadingAdminInfo(false);
      }
    };

    fetchAdminInfo();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:4999/api/admin/users", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const generateInviteCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("http://localhost:4999/api/admin/generate-code", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
        setCopied(false);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setError("Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <DashboardLayout> {/* Wrapping content in DashboardLayout */}
      <div className="min-h-screen bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9] p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header section */}
          <div className="flex items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-serif font-semibold text-gray-800">Admin Dashboard</h1>
              {!loadingAdminInfo && adminInfo && (
                <span className="px-4 py-2 bg-white rounded-lg text-lg font-medium text-gray-800 shadow-sm">
                  {adminInfo.company}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin/reimbursements"
                className="px-5 py-2 bg-[#4a4e69] text-white text-sm font-medium rounded-lg hover:bg-[#2e2f3e] transition-colors duration-200 shadow-sm"
              >
                View Reimbursement History
              </Link>

              <button
                onClick={generateInviteCode}
                disabled={isGenerating}
                className="px-5 py-2 bg-[#f7caca] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#f5b8b8] transition-colors duration-200 shadow-sm flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate New Code'
                )}
              </button>
            </div>
          </div>

          {/* Generated code display section */}
          {generatedCode && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex flex-col items-center space-y-6">
                <span className="text-gray-600">Your invite code is ready:</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-semibold tracking-wider bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 text-gray-900">
                    {generatedCode.match(/.{1,4}/g)?.join(' ')}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002-2M8 5a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                      />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-500">Click the copy icon to copy the code</span>
                {copied && (
                  <span className="text-green-600 text-sm">Copied to clipboard!</span>
                )}
              </div>
            </div>
          )}

          {/* Users List Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-serif font-semibold text-gray-800 mb-4">Joined Members</h2>
            
            {loadingUsers ? (
              <div className="text-center py-8 text-gray-700">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : users.length === 0 ? (
              <div className="text-center text-gray-700 py-8">No requests yet</div>
            ) : (
              <table className="w-full text-gray-700">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold">Name</th>
                    <th className="text-left py-4 px-4 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">{user.name}</td>
                      <td className="py-4 px-4">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
