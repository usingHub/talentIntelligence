import { useNavigate } from "react-router-dom";
import {
  dummyMetrics,
  recentActivity,
  skillDistribution,
} from "../data/dummyData";

// ── small helper: pick badge colour by score ──────────────────────────────────
function scoreBadge(score) {
  if (score >= 85) return "success";
  if (score >= 65) return "warning";
  return "danger";
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ title, value, subtitle, color }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card border-0 border-start border-4 border-${color} shadow-sm h-100`}>
        <div className="card-body">
          <p className="text-muted small mb-1">{title}</p>
          <h2 className={`fw-bold text-${color} mb-0`}>{value}</h2>
          {subtitle && (
            <p className="text-muted small mt-1 mb-0">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Score Distribution Bar ────────────────────────────────────────────────────
function DistributionBar({ range, count }) {
  const total = skillDistribution.reduce((s, d) => s + d.count, 0);
  const pct = Math.round((count / total) * 100);

  let color = "danger";
  if (range.startsWith("9")) color = "success";
  else if (range.startsWith("7")) color = "primary";
  else if (range.startsWith("6")) color = "warning";

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small mb-1">
        <span className="text-muted">{range}</span>
        <span className="fw-semibold">{count} candidates</span>
      </div>
      <div className="progress" style={{ height: "10px" }}>
        <div
          className={`progress-bar bg-${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid px-4 py-4">

      {/* ── Page Header ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-0">HR Dashboard</h4>
          <p className="text-muted small mb-0">
            Overview of all candidate intelligence
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/upload")}
        >
          + Upload Resumes
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="row g-3 mb-4">
        <MetricCard
          title="Total Resumes Uploaded"
          value={dummyMetrics.totalResumes}
          subtitle="All time"
          color="primary"
        />
        <MetricCard
          title="Avg Match Score"
          value={`${dummyMetrics.avgMatchScore}%`}
          subtitle="Across all candidates"
          color="success"
        />
        <MetricCard
          title="Skills Mapped"
          value={dummyMetrics.skillsMapped.toLocaleString()}
          subtitle="Unique skill mentions"
          color="warning"
        />
        <MetricCard
          title="Processed Today"
          value={dummyMetrics.processedToday}
          subtitle="Last 24 hours"
          color="info"
        />
      </div>

      {/* ── Bottom Row: Table + Chart ── */}
      <div className="row g-3">

        {/* Recent Activity Table */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-semibold mb-0">Recent Candidates</h6>
              <span className="badge bg-primary rounded-pill">
                {recentActivity.length} latest
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3 fw-semibold small text-muted">Candidate</th>
                      <th className="fw-semibold small text-muted">Top Skills</th>
                      <th className="fw-semibold small text-muted">Match</th>
                      <th className="fw-semibold small text-muted">Status</th>
                      <th className="fw-semibold small text-muted">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((c) => (
                      <tr key={c.id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                              style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}
                            >
                              {c.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <div className="fw-semibold small">{c.name}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>
                                {c.experience} yr exp
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {c.topSkills.map((s) => (
                              <span
                                key={s}
                                className="badge bg-light text-dark border"
                                style={{ fontSize: 11 }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge bg-${scoreBadge(c.matchScore)} rounded-pill`}
                          >
                            {c.matchScore}%
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              c.status === "Processed"
                                ? "bg-success-subtle text-success"
                                : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(`/candidate/${c.id}`)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-semibold mb-0">Match Score Distribution</h6>
              <p className="text-muted small mb-0">All {dummyMetrics.totalResumes} candidates</p>
            </div>
            <div className="card-body">
              {skillDistribution.map((d) => (
                <DistributionBar key={d.range} {...d} />
              ))}

              <hr className="my-3" />

              {/* Quick stats */}
              <div className="row text-center g-2">
                <div className="col-6">
                  <div className="bg-success-subtle rounded p-2">
                    <div className="fw-bold text-success fs-5">
                      {skillDistribution
                        .filter((d) => d.range.startsWith("9") || d.range.startsWith("7"))
                        .reduce((s, d) => s + d.count, 0)}
                    </div>
                    <div className="text-muted small">Strong fit</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-danger-subtle rounded p-2">
                    <div className="fw-bold text-danger fs-5">
                      {skillDistribution
                        .filter((d) => d.range.startsWith("0") || d.range.startsWith("4"))
                        .reduce((s, d) => s + d.count, 0)}
                    </div>
                    <div className="text-muted small">Poor fit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}