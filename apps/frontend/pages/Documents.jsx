import React, { useEffect, useMemo, useState } from "react";
import {
  getClientProjects,
  getClientProjectPrd,
  downloadDocument,
} from "../services/api";

const Documents = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [prdData, setPrdData] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingPrd, setLoadingPrd] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");
      const data = await getClientProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch client projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    setPrdData(null);
    setError("");

    if (!projectId) return;

    try {
      setLoadingPrd(true);
      const data = await getClientProjectPrd(projectId);
      if (data) {
        setPrdData(data);
      } else {
        setError("No PRD available for this project yet");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch PRD");
    } finally {
      setLoadingPrd(false);
    }
  };

  const handleDownload = async () => {
    if (!prdData?.id) {
      alert("No document to download");
      return;
    }

    try {
      setError("");
      const { blob, fileName: contentDisposition } = await downloadDocument(
        prdData.id,
      );

      if (!blob || blob.size === 0) {
        throw new Error("Received empty file from server");
      }

      // Extract filename from content-disposition header or use default
      let downloadFileName = prdData.fileName || "prd-document";
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=(['\"]?)([^'\"\n;]*)/i,
        );
        if (match && match[2]) {
          downloadFileName = match[2];
        }
      }

      // Add file extension if missing
      if (!downloadFileName.includes(".")) {
        downloadFileName += ".pdf";
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download PRD. Please try again.");
    }
  };

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  if (loadingProjects) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
        Loading client projects...
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-10">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Project Documents
        </h2>
        <p className="text-gray-500 font-medium">
          Select a project to view its PRD document.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4">
        <label className="block text-sm font-bold text-gray-700">
          Select Project
        </label>

        <select
          value={selectedProjectId}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">-- Choose a project --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name || project.title || project.id}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          {error}
        </div>
      )}

      {loadingPrd && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl">
          Loading PRD...
        </div>
      )}

      {selectedProject && !loadingPrd && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Selected Project
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <DetailCard
              label="Project Name"
              value={selectedProject.name || selectedProject.title || "-"}
            />
            <DetailCard label="Project ID" value={selectedProject.id || "-"} />
          </div>
        </div>
      )}

      {prdData && !loadingPrd && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">PRD Details</h3>
              <p className="text-gray-500">Client view for uploaded PRD</p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition"
            >
              Download PRD
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <DetailCard label="Document Name" value={prdData.fileName || "-"} />
            <DetailCard label="Document ID" value={prdData.id || "-"} />
            <DetailCard label="File Type" value={prdData.fileType || "PRD"} />
            <DetailCard
              label="Uploaded Date"
              value={
                prdData.uploadedAt
                  ? new Date(prdData.uploadedAt).toLocaleDateString()
                  : "-"
              }
            />
          </div>

          {prdData.fileUrl && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <iframe
                src={prdData.fileUrl}
                title="PRD Preview"
                className="w-full h-[600px]"
              />
            </div>
          )}

          {!prdData.fileUrl && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl">
              Preview not available. Please use download.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DetailCard = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
      {label}
    </p>
    <p className="text-base font-bold text-gray-900 mt-2 break-words">
      {value}
    </p>
  </div>
);

export default Documents;
