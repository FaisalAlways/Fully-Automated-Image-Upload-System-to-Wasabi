"use client";
import React, { useState, useEffect } from "react";

interface ImageData {
  id: string;
  key: string;
  bucket: string;
  folder: string | null;
  size: number;
  createdAt: string;
  filetype: string;
}

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [buckets, setBuckets] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);

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
            size: file.size,
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

  // Fetch all images
  const fetchImages = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/all-images");
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("❌ Failed to fetch images:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Delete
  const handleDelete = async (image: ImageData) => {
    if (!image) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/delete-image/${image.id}/${image.bucket}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        setImages((prev) => prev.filter((img) => img.id !== image.id));
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border">
        <h2 className="text-2xl font-bold mb-4 text-center">
          📤 Wasabi Image Uploader
        </h2>

        <input
          type="file"
          accept="image/*,application/pdf,audio/*,video/*"
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
      {/* DATA TABLE */}
      <div className="max-w-[95%] mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🖼 Uploaded Images
        </h2>
        <div className="overflow-x-auto border rounded-lg shadow-md">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="border p-3 text-left">ID</th>
                <th className="border p-3 text-left">Key / Name</th>
                <th className="border p-3 text-left">Bucket</th>
                <th className="border p-3 text-left">Folder</th>
                <th className="border p-3 text-left">Size (KB)</th>
                <th className="border p-3 text-left">Filetype</th>
                <th className="border p-3 text-left">Created At</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border p-2 text-sm">{img.id}</td>
                  <td className="border p-2 text-sm break-words">{img.key}</td>
                  <td className="border p-2 text-sm">{img.bucket}</td>
                  <td className="border p-2 text-sm">{img.folder || "root"}</td>
                  <td className="border p-2 text-sm">
                    {(img.size / 1024).toFixed(2)}
                  </td>
                  <td className="border p-2 text-sm">{img.filetype}</td>
                  <td className="border p-2 text-sm">
                    {new Date(img.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2 text-sm flex gap-2">
                    {/* View Button */}
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `http://localhost:8000/api/v1/generate-read-url/${img.bucket}/${img.key}`
                          );
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message);

                          const EXPIRE_TIME = 10 * 1000; // 1 minute
                          const newTab = window.open(data.url, "_blank");

                          if (newTab) {
                            setTimeout(() => {
                              newTab.close(); // auto-close after 1 minute
                            }, EXPIRE_TIME);
                          }
                        } catch (err) {
                          console.error("❌ Failed to view image:", err);
                          alert("Failed to open image");
                        }
                      }}
                    >
                      View
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(img)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
