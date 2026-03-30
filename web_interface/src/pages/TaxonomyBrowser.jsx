import { useState, useEffect } from "react";

export default function TaxonomyBrowser() {
  const [taxonomyData, setTaxonomyData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch Taxonomy from FastAPI ───────────────────────────────────────────
  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const response = await fetch("https://talentiq-backend-7dk9.onrender.com/api/v1/skills/taxonomy");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data.status === "success") {
          setTaxonomyData(data.taxonomy);
        } else {
          throw new Error("Failed to load taxonomy data");
        }
      } catch (err) {
        console.error("Error fetching taxonomy:", err);
        setError("Could not connect to the backend. Is FastAPI running?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxonomy();
  }, []);

  // ── Search & Filter Logic ────────────────────────────────────────────────
  const filteredTaxonomy = taxonomyData.filter((skill) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesCanonical = skill.canonical.toLowerCase().includes(searchLower);
    const matchesAlias = skill.aliases.some((alias) => alias.toLowerCase().includes(searchLower));
    const matchesCategory = skill.category.toLowerCase().includes(searchLower);
    
    return matchesCanonical || matchesAlias || matchesCategory;
  });

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      
      {/* ── Page Header ── */}
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Normalize Agent Dictionary</h4>
          <p className="text-muted small mb-0">
            The canonical skill taxonomy used by the AI to map raw resume text to standard required skills.
          </p>
        </div>
        
        {/* Search Bar */}
        <div style={{ minWidth: "300px" }}>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search skills, aliases, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          
          {/* Error State */}
          {error && (
            <div className="p-5 text-center text-danger">
              <div className="fs-1 mb-2">⚠️</div>
              <h6>{error}</h6>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-primary mb-3" role="status" />
              <h6>Syncing with Normalize Agent...</h6>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 fw-semibold small text-muted py-3">Canonical Skill Name</th>
                    <th className="fw-semibold small text-muted py-3">Category</th>
                    <th className="fw-semibold small text-muted py-3">Known Aliases (Raw Input)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxonomy.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4">
                        <span className="fw-bold text-dark">{item.canonical}</span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${
                          item.category === 'Technical' ? 'bg-primary-subtle text-primary' :
                          item.category === 'Soft Skill' ? 'bg-info-subtle text-info' :
                          'bg-warning-subtle text-warning'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {item.aliases.length > 0 ? (
                            item.aliases.map((alias, i) => (
                              <span key={i} className="badge bg-light text-secondary border border-secondary-subtle font-monospace" style={{ fontSize: "11px" }}>
                                "{alias}"
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small fst-italic">- None configured -</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty Search Results */}
                  {filteredTaxonomy.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-muted">
                        <div className="fs-1 mb-2 opacity-25">📭</div>
                        <h6>No skills match your search</h6>
                        <p className="small mb-0">Try searching for "React", "js", or "Technical"</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
        {/* Card Footer with count */}
        {!isLoading && !error && (
          <div className="card-footer bg-white border-top py-3 px-4 text-muted small">
            Showing {filteredTaxonomy.length} of {taxonomyData.length} canonical skills
          </div>
        )}
      </div>

    </div>
  );
}