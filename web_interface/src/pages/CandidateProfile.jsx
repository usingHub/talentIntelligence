import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { recentActivity } from "../data/dummyData";

// ---------------------------------------------------------------------------
// Normalise candidate shape regardless of whether it came from:
//   A) recentActivity (Dashboard) — uses: name, experience, allSkills, email
//   B) Upload batch results       — uses: candidate_name, experience_years, skills_found
// ---------------------------------------------------------------------------
function normaliseCandidate(raw) {
  if (!raw) return null;
  return {
    id:             raw.id,
    name:           raw.candidate_name  ?? raw.name           ?? "Unknown Candidate",
    experience:     raw.experience_years ?? raw.experience      ?? 0,
    email:          raw.email                                  ?? "Not provided",
    education:      raw.education                              ?? "Not provided",
    skills:         raw.skills_found    ?? raw.allSkills        ?? [],
    missingSkills:  raw.skills_missing  ?? raw.missingSkills    ?? [],
    matchScore:     raw.overall_match_score ?? raw.matchScore   ?? null,
    recommendation: raw.recommendation                         ?? "",
    status:         raw.status                                 ?? "Processed",
    fileName:       raw.fileName                               ?? null,
  };
}

// ---------------------------------------------------------------------------
// Score ring colour
// ---------------------------------------------------------------------------
function scoreColor(score) {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
}

export default function CandidateProfile() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  const [candidate,     setCandidate]     = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching,    setIsMatching]    = useState(false);
  const [matchResult,   setMatchResult]   = useState(null);
  const [error,         setError]         = useState("");

  // ── Load candidate data ───────────────────────────────────────────────────
  useEffect(() => {
    // Priority 1 — data passed through navigate() state (from Upload page)
    if (location.state?.candidate) {
      setCandidate(normaliseCandidate(location.state.candidate));
      return;
    }

    // Priority 2 — find in recentActivity by id (from Dashboard)
    const found = recentActivity.find((c) => c.id.toString() === id);
    if (found) {
      setCandidate(normaliseCandidate(found));
      return;
    }

    // Fallback — should rarely happen
    setCandidate(
      normaliseCandidate({
        name:        "Processed Candidate",
        experience:  0,
        education:   "Parsed from uploaded document",
        email:       "Not available",
        allSkills:   ["Python", "React", "FastAPI"],
        missingSkills: [],
        status:      "Processed",
      })
    );
  }, [id, location.state]);

  // ── Match API call ────────────────────────────────────────────────────────
  const runMatchEngine = async () => {
    if (!jobDescription.trim() || !candidate) return;
    setIsMatching(true);
    setMatchResult(null);
    setError("");

    try {
      const response = await fetch("https://talentiq-backend-7dk9.onrender.com/api/v1/match", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_skills: candidate.skills,   // always correct field now
          job_description:  jobDescription,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setMatchResult(data.data);
      } else {
        throw new Error("Match engine returned an unexpected response.");
      }
    } catch (err) {
      console.error("Match API error:", err);
      setError(err.message || "Could not connect to backend. Is the server running?");
    } finally {
      setIsMatching(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!candidate) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center text-muted">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="small">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="container-fluid px-4 py-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div>
          <h4 className="fw-bold mb-0">Candidate Intelligence</h4>
          <p className="text-muted small mb-0">
            Detailed profile and role gap analysis
          </p>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2 mb-4">
          <strong>Error:</strong> {error}
          <button
            className="btn-close ms-auto"
            onClick={() => setError("")}
          />
        </div>
      )}

      <div className="row g-4">

        {/* ── Left column: Candidate details ── */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              {/* Profile header */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center
                             justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 64, height: 64, fontSize: 22 }}
                >
                  {initials}
                </div>
                <div>
                  <h5 className="fw-bold mb-1">{candidate.name}</h5>
                  <span className="badge bg-success-subtle text-success rounded-pill">
                    {candidate.status}
                  </span>
                  {candidate.fileName && (
                    <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                      {candidate.fileName}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio details */}
              <div className="mb-4">
                <h6 className="fw-semibold text-muted small text-uppercase mb-3">
                  Background
                </h6>
                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="text-muted flex-shrink-0">Experience</span>
                    <span className="fw-semibold">{candidate.experience} yrs</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span className="text-muted flex-shrink-0">Education</span>
                    <span className="fw-semibold text-end">{candidate.education}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="text-muted flex-shrink-0">Email</span>
                    <span className="fw-semibold text-end"
                      style={{ wordBreak: "break-all" }}>
                      {candidate.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted skills */}
              <div className="mb-4">
                <h6 className="fw-semibold text-muted small text-uppercase mb-3">
                  Extracted Skills
                  <span className="badge bg-primary rounded-pill ms-2" style={{ fontSize: 10 }}>
                    {candidate.skills.length}
                  </span>
                </h6>
                <div className="d-flex flex-wrap gap-1">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge bg-light text-dark border py-2 px-2"
                      style={{ fontSize: 11 }}
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length === 0 && (
                    <span className="text-muted small">No skills extracted</span>
                  )}
                </div>
              </div>

              {/* Already flagged missing skills (from parse step) */}
              {candidate.missingSkills.length > 0 && (
                <div>
                  <h6 className="fw-semibold text-muted small text-uppercase mb-3">
                    Flagged Gaps
                    <span className="badge bg-danger rounded-pill ms-2" style={{ fontSize: 10 }}>
                      {candidate.missingSkills.length}
                    </span>
                  </h6>
                  <div className="d-flex flex-wrap gap-1">
                    {candidate.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="badge bg-danger-subtle text-danger border border-danger-subtle py-2 px-2"
                        style={{ fontSize: 11 }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Parse-time match score if available */}
              {candidate.matchScore !== null && (
                <div className="mt-4 p-3 bg-light rounded border">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small fw-semibold text-muted">Parse-time score</span>
                    <span className={`badge bg-${scoreColor(candidate.matchScore)} rounded-pill fs-6`}>
                      {candidate.matchScore}%
                    </span>
                  </div>
                  {candidate.recommendation && (
                    <p className="small text-muted mt-2 mb-0">
                      {candidate.recommendation}
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Right column: Match engine ── */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-semibold mb-0">Semantic Match Engine</h6>
              <p className="text-muted small mb-0">
                Paste a job description to run the Match Agent against this candidate
              </p>
            </div>

            <div className="card-body p-0">
              <div className="row g-0 h-100">

                {/* Input side */}
                <div className="col-12 col-md-5 p-4 border-end">
                  <label className="form-label fw-semibold small text-dark">
                    Target role requirements
                  </label>
                  <textarea
                    className="form-control bg-light border-0 mb-3"
                    rows={9}
                    placeholder="e.g. We are looking for a backend engineer proficient in Python, FastAPI, and container orchestration using Kubernetes..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <button
                    className="btn btn-primary w-100 fw-semibold"
                    onClick={runMatchEngine}
                    disabled={!jobDescription.trim() || isMatching}
                  >
                    {isMatching ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Analysing...
                      </>
                    ) : (
                      "Run Match Engine"
                    )}
                  </button>
                </div>

                {/* Result side */}
                <div className="col-12 col-md-7 p-4 bg-light">

                  {/* Empty state */}
                  {!matchResult && !isMatching && (
                    <div
                      className="h-100 d-flex flex-column align-items-center
                                 justify-content-center text-muted text-center"
                      style={{ minHeight: 300 }}
                    >
                      <div style={{ fontSize: 40, opacity: 0.3 }} className="mb-3">
                        🎯
                      </div>
                      <h6 className="fw-semibold">No analysis yet</h6>
                      <p className="small mb-0">
                        Paste a job description and run the engine to see the gap analysis.
                      </p>
                    </div>
                  )}

                  {/* Processing state */}
                  {isMatching && (
                    <div
                      className="h-100 d-flex flex-column align-items-center
                                 justify-content-center text-center"
                      style={{ minHeight: 300 }}
                    >
                      <div className="spinner-border text-primary mb-3" role="status" />
                      <h6 className="fw-semibold">Multi-agent analysis running</h6>
                      <p className="text-muted small mb-0">
                        Normalize Agent → Match Agent → Gap Analysis
                      </p>
                    </div>
                  )}

                  {/* Match results */}
                  {matchResult && !isMatching && (
                    <div>

                      {/* Score ring */}
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center
                                     fw-bold text-white bg-${scoreColor(matchResult.match_score)}
                                     flex-shrink-0`}
                          style={{ width: 72, height: 72, fontSize: 20 }}
                        >
                          {matchResult.match_score}%
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">Match Score</h5>
                          <p className="text-muted small mb-0">
                            {matchResult.recommendation}
                          </p>
                        </div>
                      </div>

                      {/* Gap analysis text */}
                      <div className="bg-white rounded border p-3 mb-4 shadow-sm">
                        <h6 className="fw-semibold small text-primary mb-2">
                          Gap Analysis
                        </h6>
                        <p className="small mb-0">{matchResult.gap_analysis}</p>
                      </div>

                      {/* Skills breakdown */}
                      <div className="row g-3">
                        <div className="col-12">
                          <h6 className="fw-semibold small text-success mb-2">
                            Verified skills
                          </h6>
                          <div className="d-flex flex-wrap gap-1">
                            {matchResult.matched_skills.length > 0
                              ? matchResult.matched_skills.map((s) => (
                                  <span
                                    key={s}
                                    className="badge bg-success-subtle text-success
                                               border border-success-subtle"
                                    style={{ fontSize: 11 }}
                                  >
                                    {s}
                                  </span>
                                ))
                              : <span className="text-muted small">None matched</span>
                            }
                          </div>
                        </div>

                        <div className="col-12">
                          <h6 className="fw-semibold small text-danger mb-2">
                            Missing skills
                          </h6>
                          <div className="d-flex flex-wrap gap-1">
                            {matchResult.missing_skills.length > 0
                              ? matchResult.missing_skills.map((s) => (
                                  <span
                                    key={s}
                                    className="badge bg-danger-subtle text-danger
                                               border border-danger-subtle"
                                    style={{ fontSize: 11 }}
                                  >
                                    {s}
                                  </span>
                                ))
                              : <span className="text-muted small">No critical gaps</span>
                            }
                          </div>
                        </div>
                      </div>

                      {/* Re-run button */}
                      <button
                        className="btn btn-outline-primary btn-sm mt-4 w-100"
                        onClick={() => setMatchResult(null)}
                      >
                        Clear and re-run
                      </button>

                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}