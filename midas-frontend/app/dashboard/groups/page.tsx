"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../layouts/layout";

interface Group {
  id: string;
  name: string;
  company: string;
  isPrivate: boolean;
  lastActive: string;
  memberCount: number;
  inviteCode: string;
  isActive: boolean; // Added isActive property
}

export default function GroupsPage(): JSX.Element {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch groups
  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:4999/api/groups", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to fetch groups");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("An error occurred while fetching groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Function to handle joining a group
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsJoining(true);

    try {
      const response = await fetch("http://localhost:4999/api/join_group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ group_code: groupCode }),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        setShowJoinModal(false);
        setGroupCode("");
        // Refresh the groups list
        await fetchGroups();
      } else {
        setError(data.message || "Failed to join group");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setError("An error occurred while joining the group");
    } finally {
      setIsJoining(false);
    }
  };

  // Function to switch active group and navigate to reimbursement page
  const switchActiveGroupAndNavigate = async (groupId: string) => {
    try {
      // Switch active group
      const response = await fetch("http://localhost:4999/api/switch_active_group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId }),
      });

      if (response.ok) {
        // Navigate to reimbursement page
        router.push("/dashboard/reimbursement");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to switch active group");
      }
    } catch (error) {
      console.error("Error switching active group:", error);
      setError("An error occurred while switching active group");
    }
  };

  return (
    <DashboardLayout> {/* Wrapping content in DashboardLayout */}

      <div className="min-h-screen bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-semibold text-gray-800 mb-6 text-left tracking-tight">
            Your Groups
          </h1>

          <div className="relative mb-16">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-start"></div>
          </div>

          {isLoading ? (
            <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-12 shadow-lg">
              <div className="text-center py-24">
                <p className="text-gray-700 text-lg font-medium">Loading groups...</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-12 shadow-lg">
              <div className="text-center py-24">
                <p className="text-gray-700 text-lg font-medium">No groups joined yet</p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-[#4a4e69] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#2e2f3e] transition duration-200 shadow-md mt-6"
                >
                  Join a Group
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      group.isActive ? "border-4 border-[#4a4e69]" : ""
                    }`}
                  >
                    <div className="h-36 bg-gradient-to-r from-[#fdf7f5] to-[#f7ede9] flex items-center justify-center text-gray-800 text-3xl font-serif font-semibold">
                      {group.company.charAt(0)}
                    </div>

                    <div className="p-8 flex flex-col h-[calc(100%-144px)]">
                      <div>
                        <h3 className="text-2xl font-serif font-semibold text-gray-800 mb-3">
                          {group.company}
                        </h3>
                        <p className="text-gray-600">
                          Active since {new Date(group.lastActive).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mt-auto pt-6 flex justify-end">
                        <button
                          onClick={() => switchActiveGroupAndNavigate(group.id)}
                          className="bg-[#4a4e69] text-white px-6 py-3 rounded-lg transition duration-200 font-medium hover:bg-[#2e2f3e] shadow-md hover:shadow-lg flex items-center gap-2 group"
                        >
                          Submit Reimbursements
                          <svg
                            className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowJoinModal(true)}
                  className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-md flex flex-col items-center justify-center hover:border-gray-400 hover:bg-white/70 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-[#4a4e69] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-lg font-medium">Join Another Group</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {showJoinModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 font-sans">
            <div className="w-full max-w-6xl h-[500px] m-6 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex h-full">
                {/* Left Panel */}
                <div className="w-1/2 bg-gradient-to-br from-[#fdf7f5] to-[#f7ede9] p-20 flex flex-col justify-center">
                  <div className="flex flex-col gap-6">
                    <h2 className="text-5xl font-serif font-semibold text-gray-800 leading-tight whitespace-nowrap">
                      Enter your code
                    </h2>
                    <p className="text-2xl text-gray-700 font-medium">
                      Ask your administrator for your invite code
                    </p>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="w-1/2 bg-[#faf9f6] p-20 flex flex-col justify-center">
                  <form onSubmit={handleJoinGroup} className="w-full space-y-8">
                    <div className="flex flex-col gap-6">
                      <input
                        type="text"
                        value={groupCode}
                        onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                        className="w-full bg-transparent border-0 border-b border-gray-300 text-2xl text-gray-900 focus:outline-none focus:border-gray-800 transition-colors px-0 py-2"
                        placeholder="Enter code"
                        disabled={isJoining}
                      />

                      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>

                    <div className="flex justify-end mt-12">
                      <button
                        type="button"
                        onClick={() => {
                          setShowJoinModal(false);
                          setError("");
                        }}
                        className="text-gray-800 mr-6 text-lg hover:opacity-70"
                        disabled={isJoining}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 text-gray-800 text-lg hover:opacity-70 disabled:opacity-50"
                        disabled={isJoining || !groupCode.trim()}
                      >
                        {isJoining ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-gray-800"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Joining...
                          </>
                        ) : (
                          <>
                            Join
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
