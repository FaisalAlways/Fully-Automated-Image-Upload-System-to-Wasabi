"use client";
import React, { useState, useEffect } from "react";

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [buckets, setBuckets] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  // Fetch all buckets
  const fetchBuckets = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/show-all-buckets");
      const data = await res.json();
      setBuckets(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch buckets");
    }
  };

  // Fetch folders whenever bucket changes
  useEffect(() => {
    const fetchFolders = async () => {
      if (!selectedBucket) return;

      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/show-all-folders/${selectedBucket}`
        );
        const data = await res.json();
        setFolders(data);
        setSelectedFolder(""); // reset selected folder
      } catch (err) {
        console.error(err);
        setFolders([]);
        alert("Failed to fetch folders");
      }
    };

    fetchFolders();
  }, [selectedBucket]);

  const handleUpload = async () => {
    if (!file || !selectedBucket) {
      alert("Select a file and a bucket first!");
      return;
    }

    setUploading(true);

    try {
      const folderToUse = selectedFolder || newFolderName || undefined;

      const presignRes = await fetch(
        "http://localhost:8000/api/v1/generate-presigned-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            bucketName: selectedBucket,
            folderName: folderToUse,
          }),
        }
      );

      const data = await presignRes.json();
      if (!presignRes.ok) throw new Error(data.message);

      const putRes = await fetch(data.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) throw new Error("Upload failed");

      alert(`✅ Upload Successful! File saved in: ${folderToUse || "root"}`);
      setFile(null);
      setNewFolderName("");
      setSelectedFolder("");
    } catch (err) {
      console.error(err);
      alert("❌ Upload Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-2xl font-bold mb-4 text-center">
        📤 Wasabi Image Uploader
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && setFile(e.target.files[0])}
        className="mb-4 w-full"
      />

      <button
        onClick={fetchBuckets}
        className="mb-4 w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Fetch Buckets
      </button>

      {buckets.length > 0 && (
        <select
          value={selectedBucket}
          onChange={(e) => setSelectedBucket(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select bucket</option>
          {buckets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}

      {/* Folder dropdown */}
      {folders.length > 0 && (
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="mb-4 w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Upload to root</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !selectedBucket || uploading}
        className={`w-full py-2 px-4 rounded ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
