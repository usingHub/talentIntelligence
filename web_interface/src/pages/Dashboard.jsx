import { useNavigate } from "react-router-dom";
import {
  dummyMetrics,
  recentActivity,
  skillDistribution,
} from "../data/dummyData";

// ── small helper: pick badge colour by score ──────────────────────────────────
function getBadgeClasses(score) {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
  if (score >= 65) return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
  return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
}

function getProgressColor(range) {
  if (range.startsWith("9")) return "bg-emerald-500";
  if (range.startsWith("7")) return "bg-indigo-500";
  if (range.startsWith("6")) return "bg-amber-500";
  return "bg-rose-500";
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center h-full">
      <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
      <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
      {subtitle && (
        <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ── Score Distribution Bar ────────────────────────────────────────────────────
function DistributionBar({ range, count }) {
  const total = skillDistribution.reduce((s, d) => s + d.count, 0);
  const pct = Math.round((count / total) * 100);

  const colorClass = getProgressColor(range);

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{range}</span>
        <span className="font-semibold text-slate-600">{count} candidates</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-6 py-8">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">HR Dashboard</h4>
          <p className="text-slate-600 text-sm mt-1">
            Overview of all candidate intelligence
          </p>
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2"
          onClick={() => navigate("/upload")}
        >
          <span>+</span> Upload Resumes
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Resumes Uploaded"
          value={dummyMetrics.totalResumes}
          subtitle="All time"
        />
        <MetricCard
          title="Avg Match Score"
          value={`${dummyMetrics.avgMatchScore}%`}
          subtitle="Across all candidates"
        />
        <MetricCard
          title="Skills Mapped"
          value={dummyMetrics.skillsMapped.toLocaleString()}
          subtitle="Unique skill mentions"
        />
        <MetricCard
          title="Processed Today"
          value={dummyMetrics.processedToday}
          subtitle="Last 24 hours"
        />
      </div>

      {/* ── Bottom Row: Table + Chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Activity Table */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h6 className="font-semibold text-slate-900">Recent Candidates</h6>
              <span className="bg-slate-50 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200">
                {recentActivity.length} latest
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Top Skills</th>
                    <th className="px-6 py-3">Match</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivity.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-100 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200"
                          >
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{c.name}</div>
                            <div className="text-slate-600 text-xs">
                              {c.experience} yr exp
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {c.topSkills.map((s) => (
                            <span
                              key={s}
                              className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getBadgeClasses(c.matchScore)}`}
                        >
                          {c.matchScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            c.status === "Processed"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                              : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
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

        {/* Score Distribution */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h6 className="font-semibold text-slate-900">Match Score Distribution</h6>
              <p className="text-slate-400 text-xs mt-0.5">All {dummyMetrics.totalResumes} candidates</p>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {skillDistribution.map((d) => (
                <DistributionBar key={d.range} {...d} />
              ))}

              <hr className="my-6 border-slate-100" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100/50">
                  <div className="font-bold text-emerald-600 text-xl">
                    {skillDistribution
                      .filter((d) => d.range.startsWith("9") || d.range.startsWith("7"))
                      .reduce((s, d) => s + d.count, 0)}
                  </div>
                  <div className="text-emerald-700/70 text-xs font-medium mt-0.5">Strong fit</div>
                </div>
                <div className="bg-rose-50 rounded-lg p-3 border border-rose-100/50">
                  <div className="font-bold text-rose-600 text-xl">
                    {skillDistribution
                      .filter((d) => d.range.startsWith("0") || d.range.startsWith("4"))
                      .reduce((s, d) => s + d.count, 0)}
                  </div>
                  <div className="text-rose-700/70 text-xs font-medium mt-0.5">Poor fit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}