"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  company: string;
  isPrivate: boolean;
  lastActive: string;
  memberCount: number;
  inviteCode: string;
}

export default function GroupsPage(): JSX.Element {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Fetch user's groups
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:4999/api/groups", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

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

      if (response.ok) {
        // Show success message briefly
        setShowJoinModal(false);
        setGroupCode("");
        
        // Redirect to reimbursement page
        router.push('/dashboard/reimbursement');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f7e6e6] p-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-16 text-center tracking-tight">
        Your Groups
      </h1>

      {groups.length === 0 ? (
        <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/50 backdrop-blur-sm border border-black/10 p-12 shadow-xl">
          <div className="text-center py-24">
            <p className="text-gray-800 text-lg mb-10 font-medium">No groups joined yet</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-[#f7caca] text-gray-900 px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#f5b8b8] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Join a Group
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="h-36 bg-gradient-to-r from-[#f7caca] to-[#f5b8b8] relative">
                  <div className="absolute -bottom-8 left-8">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold text-gray-900 border border-black/5">
                      {group.name.charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Card Content - Removed company section */}
                <div className="p-8 pt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{group.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-700 mb-8 font-medium">
                    <span>Group</span>
                    <span>•</span>
                    <span>Active {new Date(group.lastActive).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {[...Array(Math.min(3, group.memberCount))].map((_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-[#f7caca] border-2 border-white shadow-sm"
                        />
                      ))}
                      {group.memberCount > 3 && (
                        <div className="w-10 h-10 rounded-full bg-[#f5b8b8] border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-900">
                          +{group.memberCount - 3}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/reimbursement?groupId=${group.id}`)}
                      className="text-gray-900 hover:bg-black/5 px-6 py-3 rounded-xl transition-all duration-200 font-bold"
                    >
                      Submit Reimbursements →
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Join Group Button */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="h-full min-h-[400px] rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center hover:border-gray-400 hover:bg-white/70 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#f7caca] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-gray-800 text-lg font-bold">Join Another Group</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-6xl max-h-[80vh] m-6 rounded-3xl overflow-hidden shadow-2xl">
            {/* Left Panel */}
            <div className="w-1/2 bg-gradient-to-br from-[#f7caca] to-[#f5b8b8] p-16 flex flex-col">
              <h2 className="text-6xl font-bold text-gray-900 mb-auto leading-tight">
                Enter your code
              </h2>
              <p className="text-2xl text-gray-800 font-medium">
                Ask your administrator for your invite code
              </p>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 bg-[#faf9f6] p-16 flex flex-col justify-center">
              <form onSubmit={handleJoinGroup} className="w-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-black rounded-full" />
                    <input
                      type="text"
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                      className="w-full bg-transparent border-b-2 border-black text-xl focus:outline-none pb-2"
                      placeholder="Enter code"
                      disabled={isJoining}
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setError("");
                    }}
                    className="text-black mr-4 hover:opacity-70"
                    disabled={isJoining}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-black hover:opacity-70 disabled:opacity-50"
                    disabled={isJoining || !groupCode.trim()}
                  >
                    {isJoining ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </>
                    ) : (
                      <>
                        Join
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
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
      )}
    </div>
  );
} 