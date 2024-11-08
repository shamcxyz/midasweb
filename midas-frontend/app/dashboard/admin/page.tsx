"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  joinCode: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    try {
      const response = await fetch("http://localhost:4999/api/admin/generate-code", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setError("Failed to generate code");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Code Generation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generate Invite Code</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={generateInviteCode}
              className="bg-[#f7caca] text-black px-6 py-2 rounded-full hover:bg-[#f5b8b8] transition-colors duration-200"
            >
              Generate New Code
            </button>
            {generatedCode && (
              <div className="flex items-center gap-2">
                <span className="font-mono bg-gray-100 px-4 py-2 rounded-lg">
                  {generatedCode}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users List Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reimbursed Requests</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No requests yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4">Name</th>
                    <th className="text-left py-4 px-4">Email</th>
                    <th className="text-left py-4 px-4">Company</th>
                    <th className="text-left py-4 px-4">Join Code</th>
                    <th className="text-left py-4 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">{user.name}</td>
                      <td className="py-4 px-4">{user.email}</td>
                      <td className="py-4 px-4">{user.company}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {user.joinCode}
                        </span>
                      </td>
                      <td className="py-4 px-4">
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
