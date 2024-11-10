"use client";

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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  // Fetch admin info
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
      }
    };

    fetchAdminInfo();
  }, []);

  // Fetch users who joined using admin's codes
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
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Generate new invite code
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
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] p-8">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          {adminInfo && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-6 py-3 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 animate-gradient-x">
                  {adminInfo.company}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <Link
          href="/dashboard/admin/reimbursements"
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Reimbursements
        </Link>
      </div>

        {/* Enhanced Code Generation Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Generate Invite Code</h2>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              onClick={generateInviteCode}
              disabled={isGenerating}
              className={`bg-[#f7caca] text-gray-900 px-6 py-2.5 rounded-full hover:bg-[#f5b8b8] transition-all duration-200 flex items-center gap-2 ${
                isGenerating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Generate New Code
                </>
              )}
            </button>
          </div>

          {/* Code Display Section */}
          <div className={`bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200 transition-opacity duration-200 ${
            generatedCode ? 'opacity-100' : 'opacity-0 hidden'
          }`}>
            <div className="flex flex-col items-center space-y-4">
              <span className="text-sm font-medium text-gray-700">Your invite code is ready:</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-semibold tracking-wider bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 text-gray-900">
                  {generatedCode.match(/.{1,4}/g)?.join(' ')}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {copied ? 'Copied to clipboard!' : 'Click the copy icon to copy the code'}
              </span>
            </div>
          </div>
        </div>

        {/* Users List Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Joined Members</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-700">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-700 py-8">No requests yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Name</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Email</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Company</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Join Code</th>
                    <th className="text-left py-4 px-4 text-gray-900 font-semibold">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-800">{user.name}</td>
                      <td className="py-4 px-4 text-gray-800">{user.email}</td>
                      <td className="py-4 px-4 text-gray-800">{user.company}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {user.joinCode}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-800">
                        {new Date(user.createdAt).toLocaleDateString()}
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
