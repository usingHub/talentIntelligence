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
    <div className="w-full px-6 py-8 relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">Normalize Agent Dictionary</h4>
          <p className="text-slate-600 text-sm mt-1">
            The canonical skill taxonomy used by the AI to map raw resume text to standard required skills.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full sm:w-96">
          <div className="flex items-center bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
            <span className="pl-3 pr-2 text-slate-400">🔍</span>
            <input
              type="text"
              className="w-full py-2.5 pr-3 text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
              placeholder="Search skills, aliases, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          
        {/* Error State */}
        {error && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="text-4xl mb-4 text-rose-500">⚠️</div>
            <h6 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Taxonomy</h6>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="p-16 text-center flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-slate-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h6 className="text-lg font-semibold text-slate-900 mb-2">Syncing Setup</h6>
            <p className="text-sm text-slate-600">Syncing with Normalize Agent...</p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Canonical Skill Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Known Aliases (Raw Input)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTaxonomy.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{item.canonical}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.category === 'Technical' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
                        item.category === 'Soft Skill' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-2xl whitespace-normal cursor-default">
                        {item.aliases.length > 0 ? (
                          item.aliases.map((alias, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[11px] px-2 py-0.5 rounded-md">
                              "{alias}"
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">- None configured -</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Empty Search Results */}
                {filteredTaxonomy.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-16">
                      <div className="text-5xl mb-4 opacity-30 text-slate-400">📭</div>
                      <h6 className="text-lg font-semibold text-slate-900 mb-2">No skills match your search</h6>
                      <p className="text-sm text-slate-600">Try searching for "React", "js", or "Technical"</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Card Footer with count */}
        {!isLoading && !error && (
          <div className="bg-slate-50/50 border-t border-slate-200 py-3 px-6 text-slate-400 text-xs font-medium">
            Showing {filteredTaxonomy.length} of {taxonomyData.length} canonical skills
          </div>
        )}

      </div>
    </div>
  );
}