import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { recentActivity } from "../data/dummyData";
import { useTalent } from "../context/TalentContext";

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
function getScoreClasses(score) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
  if (score >= 60) return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
  return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
}

function getSolidScoreClasses(score) {
  if (score >= 80) return "bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-emerald-600/20";
  if (score >= 60) return "bg-amber-500 text-white shadow-sm ring-1 ring-inset ring-amber-600/20";
  return "bg-rose-500 text-white shadow-sm ring-1 ring-inset ring-rose-600/20";
}

export default function CandidateProfile() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();
  const { jobDescription, setJobDescription, evaluations, saveEvaluation } = useTalent();

  const [candidate,     setCandidate]     = useState(null);
  const [isMatching,    setIsMatching]    = useState(false);
  const [matchResult,   setMatchResult]   = useState(null);
  const [error,         setError]         = useState("");
  const [lastRunJD,     setLastRunJD]     = useState("");

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
  const runMatchEngine = async (currentCandidate = candidate) => {
    if (!jobDescription.trim() || !currentCandidate) return;
    setIsMatching(true);
    setMatchResult(null);
    setError("");
    setLastRunJD(jobDescription);

    try {
      const response = await fetch("https://talentiq-backend-7dk9.onrender.com/api/v1/match", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_skills: currentCandidate.skills,   // always correct field now
          job_description:  jobDescription,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        // FASTAPI MAPPING: Map the API response specifically to the requested JSON map
        const mappedEval = {
          score: data.data.match_score ?? 0,
          verified_skills: data.data.matched_skills ?? [],
          missing_skills: data.data.missing_skills ?? [],
          ai_deduction: data.data.gap_analysis ?? ""
        };
        
        setMatchResult(mappedEval);
        saveEvaluation(currentCandidate.id, mappedEval);
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

  // Auto-load state or run engine
  useEffect(() => {
    if (candidate) {
      // If we already have a cached evaluation, inject it instantly
      if (evaluations[candidate.id]) {
        setMatchResult(evaluations[candidate.id]);
        setLastRunJD(jobDescription);
      } 
      // If we have a global JD but NO evaluation, AUTO-RUN immediately
      else if (jobDescription.trim() && !isMatching && !matchResult) {
        runMatchEngine(candidate);
      }
    }
  }, [candidate]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-slate-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 text-sm">Loading candidate profile...</p>
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
    <div className="w-full px-6 py-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors shadow-sm"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <div>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Intelligence</h4>
          <p className="text-slate-600 text-sm mt-0.5">
            Detailed profile and role gap analysis
          </p>
        </div>
      </div>

      {/* ── Error banner ── */}
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

        {/* ── Left column: Candidate details ── */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full p-6">

            {/* Profile header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div
                className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl shrink-0 border border-slate-200"
              >
                {initials}
              </div>
              <div>
                <h5 className="font-bold text-lg text-slate-900 mb-1">{candidate.name}</h5>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  candidate.status === "Processed" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {candidate.status}
                </span>
                {candidate.fileName && (
                  <div className="text-slate-400 text-xs mt-1.5 break-all">
                    {candidate.fileName}
                  </div>
                )}
              </div>
            </div>

            {/* Bio details */}
            <div className="mb-6">
              <h6 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-3">
                Background
              </h6>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 shrink-0">Experience</span>
                  <span className="font-semibold text-slate-900">{candidate.experience} yrs</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-slate-500 shrink-0">Education</span>
                  <span className="font-semibold text-slate-900 text-right">{candidate.education}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 shrink-0">Email</span>
                  <span className="font-semibold text-slate-900 text-right break-all">
                    {candidate.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted skills */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h6 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-0">
                  Extracted Skills
                </h6>
                <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                  {candidate.skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] px-2.5 py-1 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length === 0 && (
                  <span className="text-slate-400 text-sm italic">No skills extracted</span>
                )}
              </div>
            </div>

            {/* Already flagged missing skills (from parse step) */}
            {candidate.missingSkills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h6 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-0">
                    Flagged Gaps
                  </h6>
                  <span className="bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                    {candidate.missingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] px-2.5 py-1 rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Parse-time match score if available */}
            {candidate.matchScore !== null && (
              <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-700">Parse-time score</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getScoreClasses(candidate.matchScore)}`}>
                    {candidate.matchScore}%
                  </span>
                </div>
                {candidate.recommendation && (
                  <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">
                    "{candidate.recommendation}"
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Right column: Match engine ── */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
              <h6 className="font-semibold text-slate-900">Semantic Match Engine</h6>
              <p className="text-slate-500 text-xs mt-0.5">
                Paste a job description to run the Match Agent against this candidate
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">

              {/* Input side */}
              <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col relative">
                <label className="block font-semibold text-sm text-slate-900 mb-2">
                  Target role requirements
                </label>
                <textarea
                  className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-lg p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none mb-4"
                  placeholder="e.g. We are looking for a backend engineer proficient in Python, FastAPI, and container orchestration using Kubernetes..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:-translate-y-[1px] transition-all disabled:bg-slate-300 disabled:shadow-none disabled:-translate-y-0 disabled:text-slate-500 flex justify-center items-center gap-2"
                  onClick={() => runMatchEngine(candidate)}
                  disabled={!jobDescription.trim() || isMatching || jobDescription === lastRunJD}
                >
                  {isMatching ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analysing...
                    </>
                  ) : matchResult ? (
                    "Update Role & Re-Run"
                  ) : (
                    "Run Match Engine"
                  )}
                </button>
              </div>

              {/* Result side */}
              <div className="md:col-span-7 p-6 bg-slate-50/50 flex flex-col">

                {/* Empty state */}
                {!matchResult && !isMatching && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="text-5xl opacity-30 mb-4 text-slate-400">
                      🎯
                    </div>
                    <h6 className="font-semibold text-slate-900 mb-2">No analysis yet</h6>
                    <p className="text-sm text-slate-600 max-w-xs">
                      Paste a job description and run the engine to see the gap analysis.
                    </p>
                  </div>
                )}

                {/* Processing state */}
                {isMatching && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <svg className="animate-spin h-10 w-10 text-slate-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h6 className="font-semibold text-slate-900 mb-2">Multi-agent analysis running</h6>
                    <p className="text-sm text-slate-600">
                      Normalize Agent → Match Agent → Gap Analysis
                    </p>
                  </div>
                )}

                {/* Match results */}
                {matchResult && !isMatching && (
                  <div className="flex-1 overflow-y-auto pr-2">

                    {/* Score ring */}
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${getSolidScoreClasses(matchResult.score)}`}
                      >
                        {matchResult.score}%
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 mb-1">Match Score</h5>
                      </div>
                    </div>

                    {/* Gap analysis text */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
                      <h6 className="font-semibold text-xs uppercase tracking-wider text-slate-600 mb-2">
                        Gap Analysis
                      </h6>
                      <p className="text-sm text-slate-700 leading-relaxed">{matchResult.ai_deduction}</p>
                    </div>

                    {/* Skills breakdown */}
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h6 className="font-semibold text-xs uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-2">
                          Verified skills
                        </h6>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.verified_skills.length > 0
                            ? matchResult.verified_skills.map((s) => (
                                <span
                                  key={s}
                                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] px-2.5 py-1 rounded-md font-medium"
                                >
                                  {s}
                                </span>
                              ))
                            : <span className="text-slate-400 text-sm italic">None matched</span>
                          }
                        </div>
                      </div>

                      <div>
                        <h6 className="font-semibold text-xs uppercase tracking-wider text-rose-600 mb-3 border-b border-rose-100 pb-2">
                          Missing skills
                        </h6>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.missing_skills.length > 0
                            ? matchResult.missing_skills.map((s) => (
                                <span
                                  key={s}
                                  className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] px-2.5 py-1 rounded-md font-medium"
                                >
                                  {s}
                                </span>
                              ))
                            : <span className="text-slate-400 text-sm italic">No critical gaps</span>
                          }
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}