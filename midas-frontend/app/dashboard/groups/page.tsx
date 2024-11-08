"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
}

export default function GroupsPage(): JSX.Element {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupCode, setGroupCode] = useState("");

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
    try {
      const response = await fetch("http://localhost:4999/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code: groupCode }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups([...groups, newGroup]);
        setShowJoinModal(false);
        setGroupCode("");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#faf9f6]">
      <h1 className="text-4xl font-bold text-black mb-12">Your Groups</h1>

      <div className="w-full max-w-2xl rounded-3xl border-2 border-black p-8 mb-8">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-black-500 mb-8">There's nothing here...</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-[#f7caca] text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-[#f5b8b8] transition-colors duration-200"
            >
              Join a Group
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/dashboard/reimbursement?groupId=${group.id}`)}
                className="p-4 border border-black-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                {group.name}
              </div>
            ))}
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full bg-[#f7caca] text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-[#f5b8b8] transition-colors duration-200"
            >
              Join a Group
            </button>
          </div>
        )}
      </div>

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-full h-full flex">
            {/* Left Panel */}
            <div className="w-1/2 bg-[#f7caca] p-16 flex flex-col">
              <h2 className="text-5xl font-normal text-black mb-auto">
                Enter your code:
              </h2>
              <p className="text-2xl text-center">
                Ask your administrator for your invite code
              </p>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 bg-[#faf9f6] p-16 flex flex-col justify-center">
              <form onSubmit={handleJoinGroup} className="w-full">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-black rounded-full" />
                  <input
                    type="text"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-black text-xl focus:outline-none pb-2"
                    placeholder="Enter code"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="text-black mr-4 hover:opacity-70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-black hover:opacity-70"
                  >
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