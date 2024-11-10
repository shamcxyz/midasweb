"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

export default function UploadPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("receipt");
  const reimbursementType = searchParams.get("type");
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    admin_email: ''
  });
  const [details, setDetails] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    status: string;
    feedback: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('http://localhost:4999/api/profile', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUserDetails({
            name: data.name,
            email: data.email,
            admin_email: data.group_admin_email
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } 
    };
    fetchUserDetails();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if user is logged in first
    const userResponse = await fetch("http://localhost:4999/api/profile", {
      credentials: "include"
    });
    
    if (!userResponse.ok) {
      alert("Please log in first");
      router.push("/login");
      return;
    }

    if (!file || !amount || !details) {
      alert("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", userDetails.name);
    formData.append("email", userDetails.email);
    formData.append("admin_email", userDetails.admin_email);
    formData.append("reimbursement_details", JSON.stringify({
      type: reimbursementType,
      amount: amount,
      documentType: documentType,
      details: details
    }));
    formData.append("receipt", file);

    try {
      const response = await fetch("http://localhost:4999/api/request_reimbursement", {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSubmissionResult({
          status: result.status,
          feedback: result.feedback
        });
        setShowModal(true);
      } else {
        throw new Error("Reimbursement request failed");
      }
    } catch (error) {
      console.error("Error submitting reimbursement request:", error);
      setSubmissionResult({
        status: "Error",
        feedback: "Failed to submit reimbursement request. Please try again."
      });
      setShowModal(true);
    }
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Upload {reimbursementType} Receipt
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-gray-700 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              required
            >
              <option value="receipt">Receipt</option>
              <option value="proof_of_purchase">Proof of Purchase</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Reimbursement Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter details about your reimbursement request"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-gray-700 bg-gray-50"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-3">
              Upload Document
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 text-gray-700 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm">
                  {file ? file.name : "Drop files here or click to upload"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-1/2 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200 shadow-md"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-1/2 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200 shadow-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Submission Result
            </h2>
            <div className="mb-6">
              <p className="text-xl font-semibold text-gray-800 mb-2">
                Status: <span className="text-purple-600">{submissionResult?.status}</span>
              </p>
              <p className="text-gray-700 text-lg">
                {submissionResult?.feedback}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/dashboard/groups")}
                className="w-1/2 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200 shadow-md"
              >
                Return to Groups
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFile(null);
                  setAmount("");
                  setDetails("");
                  setSubmissionResult(null);
                }}
                className="w-1/2 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200 shadow-md"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}