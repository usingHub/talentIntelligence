import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
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
    // reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setError("");
  };

  // ── Score badge colour ────────────────────────────────────────────────────
  const scoreBadgeColor = (score) => {
    if (score >= 85) return "success";
    if (score >= 65) return "warning";
    return "danger";
  };

  // ── API Submission — uses /api/v1/parse/batch correctly ──────────────────
  const handleProcessBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResults([]);
    setError("");

    // Build ONE FormData with ALL files attached under the key "files"
    // This matches FastAPI's: files: List[UploadFile] = File(...)
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/parse/batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // data.results is an array of { filename, status, data: { candidate fields } }
      const formatted = data.results.map((item, idx) => ({
        id: `candidate-${idx}-${Date.now()}`,
        fileName: item.filename,
        status: item.status,
        ...item.data,
      }));

      setResults(formatted);
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
    <div className="container-fluid px-4 py-4">

      {/* ── Page Header ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-0">Bulk Candidate Processing</h4>
          <p className="text-muted small mb-0">
            Upload multiple resumes and map them against a job description simultaneously.
          </p>
        </div>
        {(results.length > 0 || files.length > 0) && (
          <button className="btn btn-outline-secondary btn-sm" onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2 mb-4" role="alert">
          <strong>Error:</strong> {error}
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setError("")}
          />
        </div>
      )}

      <div className="row g-4">

        {/* ── Left Column: Inputs ── */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-semibold mb-0">Upload Configuration</h6>
            </div>
            <div className="card-body d-flex flex-column gap-4">

              {/* Job Description */}
              <div>
                <label className="form-label fw-semibold small text-dark">
                  Target Job Description
                  <span className="text-muted fw-normal ms-1">(optional)</span>
                </label>
                <textarea
                  className="form-control bg-light border-0"
                  rows={4}
                  placeholder="Paste the job requirements, required skills, and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="form-text">
                  Used by the Match Agent to calculate fit scores.
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div>
                <label className="form-label fw-semibold small text-dark">
                  Upload Resumes
                  <span className="text-muted fw-normal ms-1">(PDF, DOCX, TXT)</span>
                </label>
                <div
                  className={`rounded p-4 text-center ${
                    isDragging
                      ? "border border-primary bg-primary-subtle"
                      : "bg-light border"
                  }`}
                  style={{
                    borderStyle: "dashed",
                    borderWidth: "2px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    className="d-none"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  <div className="mb-2" style={{ fontSize: 32 }}>
                    {isDragging ? "⬇️" : "📄"}
                  </div>
                  <p className="fw-semibold text-primary small mb-1">
                    {isDragging
                      ? "Drop files here"
                      : "Click to browse or drag and drop"}
                  </p>
                  <p className="text-muted" style={{ fontSize: 12 }}>
                    Max 20 files per batch
                  </p>
                </div>
              </div>

              {/* File Queue */}
              {files.length > 0 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold small">
                      Queue
                    </span>
                    <span className="badge bg-primary rounded-pill">
                      {files.length} file{files.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div
                    className="d-flex flex-column gap-2 overflow-auto"
                    style={{ maxHeight: "180px" }}
                  >
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="d-flex justify-content-between align-items-center bg-white border rounded px-3 py-2"
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="small fw-semibold text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {file.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          className="btn btn-sm text-danger border-0 p-1 ms-2"
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
                className="btn btn-primary w-100 py-2 fw-semibold mt-auto"
                onClick={handleProcessBatch}
                disabled={files.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Processing {files.length} resume{files.length > 1 ? "s" : ""}...
                  </>
                ) : files.length === 0 ? (
                  "Upload files to begin"
                ) : (
                  `Process ${files.length} Resume${files.length > 1 ? "s" : ""}`
                )}
              </button>

            </div>
          </div>
        </div>

        {/* ── Right Column: Results ── */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-semibold mb-0">Batch Results</h6>
              {results.length > 0 && (
                <span className="badge bg-success rounded-pill">
                  {results.length} processed
                </span>
              )}
            </div>

            <div className="card-body p-0">

              {/* Empty state — nothing uploaded yet */}
              {results.length === 0 && !isProcessing && (
                <div className="text-center text-muted py-5 px-4">
                  <div className="mb-3" style={{ fontSize: 48, opacity: 0.3 }}>
                    ⚙️
                  </div>
                  <h6 className="fw-semibold">Awaiting batch</h6>
                  <p className="small mb-0">
                    Upload resumes and click Process to see AI-extracted profiles,
                    skill mappings, and match scores here.
                  </p>
                </div>
              )}

              {/* Processing state */}
              {isProcessing && (
                <div className="text-center py-5 px-4">
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <h6 className="fw-semibold">Running agents...</h6>
                  <p className="text-muted small mb-0">
                    Parse Agent → Normalize Agent → Match Agent
                  </p>
                </div>
              )}

              {/* Results table */}
              {results.length > 0 && !isProcessing && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3 fw-semibold small text-muted">Candidate</th>
                        <th className="fw-semibold small text-muted">Skills Found</th>
                        <th className="fw-semibold small text-muted">Missing</th>
                        <th className="fw-semibold small text-muted">Score</th>
                        <th className="fw-semibold small text-muted">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((res) => (
                        <tr key={res.id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                style={{ width: 34, height: 34, fontSize: 12 }}
                              >
                                {res.candidate_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <div className="fw-semibold small">
                                  {res.candidate_name}
                                </div>
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                  {res.experience_years} yr • {res.fileName}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {res.skills_found.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="badge bg-success-subtle text-success border border-success-subtle"
                                  style={{ fontSize: 10 }}
                                >
                                  {s}
                                </span>
                              ))}
                              {res.skills_found.length > 3 && (
                                <span
                                  className="badge bg-light text-muted border"
                                  style={{ fontSize: 10 }}
                                >
                                  +{res.skills_found.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {res.skills_missing.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="badge bg-danger-subtle text-danger border border-danger-subtle"
                                  style={{ fontSize: 10 }}
                                >
                                  {s}
                                </span>
                              ))}
                              {res.skills_missing.length > 2 && (
                                <span
                                  className="badge bg-light text-muted border"
                                  style={{ fontSize: 10 }}
                                >
                                  +{res.skills_missing.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`badge bg-${scoreBadgeColor(
                                res.overall_match_score
                              )} rounded-pill`}
                            >
                              {res.overall_match_score}%
                            </span>
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
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