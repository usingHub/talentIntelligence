import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "nav-link active fw-semibold" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
      <Link className="navbar-brand fw-bold fs-4 text-white" to="/">
        <span className="text-primary">Talent</span>IQ
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto gap-1">
          <li className="nav-item">
            <Link className={isActive("/")} to="/">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={isActive("/upload")} to="/upload">
              Upload Resumes
            </Link>
          </li>
          <li className="nav-item">
            <Link className={isActive("/taxonomy")} to="/taxonomy">
              Skill Taxonomy
            </Link>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
            >
              API Docs ↗
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}