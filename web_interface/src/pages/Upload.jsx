import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTalent } from "../context/TalentContext";

export default function Upload() {
  const navigate = useNavigate();
  const { jobDescription, setJobDescription, uploadedCandidates, setUploadedCandidates } = useTalent();
  
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.match(/\.(pdf|docx|txt)$/i)
    );
    if (dropped.length > 0) setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setUploadedCandidates([]);
    setError("");
  };

  // ── Score badge colour ────────────────────────────────────────────────────
  const getBadgeClasses = (score) => {
    if (score >= 85) return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
    if (score >= 65) return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
    return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
  };

  // ── API Submission — uses /api/v1/parse/batch correctly ──────────────────
  const handleProcessBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setUploadedCandidates([]);
    setError("");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("https://talentiq-backend-7dk9.onrender.com/api/v1/parse/batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      const formatted = data.results.map((item, idx) => ({
        id: `candidate-${idx}-${Date.now()}`,
        fileName: item.filename,
        status: item.status,
        ...item.data,
      }));

      setUploadedCandidates(formatted);
      setFiles([]);
    } catch (err) {
      console.error("Batch processing error:", err);
      setError(err.message || "Could not connect to backend. Is the server running?");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Navigate to candidate profile, passing full data via state ───────────
  const handleReviewCandidate = (candidate) => {
    navigate(`/candidate/${candidate.id}`, { state: { candidate } });
  };

  return (
    <div className="w-full px-6 py-8">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk Candidate Processing</h4>
          <p className="text-slate-500 text-sm mt-1">
            Upload multiple resumes and map them against a job description simultaneously.
          </p>
        </div>
        {(uploadedCandidates.length > 0 || files.length > 0) && (
          <button 
            className="text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors shadow-sm"
            onClick={clearAll}
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-6 relative rounded-r-lg shadow-sm" role="alert">
          <div className="flex items-center gap-3">
            <span className="text-rose-500 text-lg">⚠️</span>
            <div>
              <strong className="font-semibold text-rose-900">Error:</strong>
              <span className="text-rose-700 ml-1">{error}</span>
            </div>
          </div>
          <button
            type="button"
            className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 transition-colors"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* ── Left Column: Inputs ── */}
        <div className="xl:col-span-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
              <h6 className="font-semibold text-slate-900">Upload Configuration</h6>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1">

              {/* Job Description */}
              <div>
                <label className="block font-semibold text-sm text-slate-900 mb-2">
                  Target Job Description
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  rows={4}
                  placeholder="Paste the job requirements, required skills, and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="text-xs text-slate-500 mt-2">
                  Used by the Match Agent to calculate fit scores.
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div>
                <label className="block font-semibold text-sm text-slate-900 mb-2">
                  Upload Resumes
                  <span className="text-slate-400 font-normal ml-1">(PDF, DOCX, TXT)</span>
                </label>
                <div
                  className={`rounded-xl p-8 text-center border-2 border-dashed transition-all cursor-pointer ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  <div className="text-4xl mb-3">
                    {isDragging ? "⬇️" : "📄"}
                  </div>
                  <p className="font-semibold text-indigo-600 text-sm mb-1">
                    {isDragging
                      ? "Drop files here"
                      : "Click to browse or drag and drop"}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Max 20 files per batch
                  </p>
                </div>
              </div>

              {/* File Queue */}
              {files.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-sm text-slate-900">
                      Queue
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {files.length} file{files.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div
                    className="flex flex-col gap-2 overflow-y-auto pr-1"
                    style={{ maxHeight: "180px" }}
                  >
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm"
                      >
                        <div className="min-w-0 pr-4">
                          <div
                            className="text-sm font-semibold text-slate-900 truncate"
                          >
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          onClick={() => removeFile(idx)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-auto ${
                  files.length === 0 || isProcessing || jobDescription.trim() === ""
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-[1px]"
                }`}
                onClick={handleProcessBatch}
                disabled={files.length === 0 || isProcessing || jobDescription.trim() === ""}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-indigo-600">Processing {files.length} resume{files.length > 1 ? "s" : ""}...</span>
                  </>
                ) : files.length === 0 ? (
                  "Upload files to begin"
                ) : jobDescription.trim() === "" ? (
                  "Enter a Job Description"
                ) : (
                  `Process ${files.length} Resume${files.length > 1 ? "s" : ""}`
                )}
              </button>

            </div>
          </div>
        </div>

        {/* ── Right Column: Results ── */}
        <div className="xl:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center rounded-t-xl">
              <h6 className="font-semibold text-slate-900">Batch Results</h6>
              <div className="flex items-center gap-3">
                {uploadedCandidates.length > 0 && (
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
                    onClick={() => {
                      if (uploadedCandidates.length === 0) return;
                      const headers = ["Candidate ID", "Name", "Experience", "Status", "Score", "FileName"];
                      const rows = uploadedCandidates.map(c => [
                        c.id, 
                        c.candidate_name, 
                        c.experience_years, 
                        c.status, 
                        c.overall_match_score || "", 
                        c.fileName
                      ]);
                      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", "candidates_export.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    📥 Export Batch to CSV
                  </button>
                )}
                {uploadedCandidates.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {uploadedCandidates.length} processed
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col p-0 overflow-y-auto">

              {/* Empty state — nothing uploaded yet */}
              {uploadedCandidates.length === 0 && !isProcessing && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="text-6xl opacity-30 mb-4">
                    ⚙️
                  </div>
                  <h6 className="text-lg font-semibold text-slate-900 mb-2">Awaiting batch</h6>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Upload resumes and click Process to see AI-extracted profiles,
                    skill mappings, and match scores here.
                  </p>
                </div>
              )}

              {/* Processing state */}
              {isProcessing && (
                <div className="flex-1 flex flex-col items-center justify-center py-16">
                  <svg className="animate-spin h-10 w-10 text-indigo-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <h6 className="text-lg font-semibold text-slate-900 mb-2">Running agents...</h6>
                  <p className="text-sm text-slate-500">
                    Parse Agent → Normalize Agent → Match Agent
                  </p>
                </div>
              )}

              {/* Results table */}
              {uploadedCandidates.length > 0 && !isProcessing && (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Candidate</th>
                        <th className="px-6 py-3">Skills Found</th>
                        <th className="px-6 py-3">Missing</th>
                        <th className="px-6 py-3">Score</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {uploadedCandidates.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0"
                              >
                                {res.candidate_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {res.candidate_name}
                                </div>
                                <div className="text-slate-500 text-xs mt-0.5">
                                  {res.experience_years} yr • {res.fileName}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5 max-w-[200px] whitespace-normal">
                              {res.skills_found.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                              {res.skills_found.length > 3 && (
                                <span
                                  className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                >
                                  +{res.skills_found.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5 max-w-[200px] whitespace-normal">
                              {res.skills_missing.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                              {res.skills_missing.length > 2 && (
                                <span
                                  className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                >
                                  +{res.skills_missing.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getBadgeClasses(
                                res.overall_match_score
                              )}`}
                            >
                              {res.overall_match_score}%
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              className="text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                              onClick={() => handleReviewCandidate(res)}
                            >
                              Review
                            </button>
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

      </div>
    </div>
  );
}