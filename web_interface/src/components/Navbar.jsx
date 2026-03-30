import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-indigo-600 font-semibold"
      : "text-slate-500 hover:text-slate-900 font-medium transition-colors";

  return (
    <nav className="flex flex-wrap items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <Link className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1" to="/">
        <span className="text-indigo-600">Talent</span>IQ
      </Link>

      <div className="flex flex-wrap items-center gap-6 mt-3 sm:mt-0">
        <Link className={isActive("/")} to="/">
          Dashboard
        </Link>
        <Link className={isActive("/upload")} to="/upload">
          Upload Resumes
        </Link>
        <Link className={isActive("/taxonomy")} to="/taxonomy">
          Skill Taxonomy
        </Link>
        <a
          className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
          href="https://talentiq-backend-7dk9.onrender.com/docs"
          target="_blank"
          rel="noreferrer"
        >
          API Docs ↗
        </a>
        
        {/* ── High-Visibility CTA Button ── */}
        <Link 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all flex items-center gap-2 ml-2" 
          to="/extension"
        >
          <span className="text-base">🧩</span> Get Extension
        </Link>
      </div>
    </nav>
  );
}