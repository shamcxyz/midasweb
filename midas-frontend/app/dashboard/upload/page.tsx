"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

export default function UploadPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("receipt");
  const reimbursementType = searchParams.get("type");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file || !amount) {
      alert("Please select a file and enter an amount");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", reimbursementType || "");
    formData.append("amount", amount);
    formData.append("documentType", documentType);

    try {
      const response = await fetch("http://localhost:4999/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
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
                  accept="image/*,.pdf"
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
    </div>
  );
}