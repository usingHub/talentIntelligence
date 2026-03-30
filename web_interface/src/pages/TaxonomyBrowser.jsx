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

  const groupedTaxonomy = filteredTaxonomy.reduce((acc, skill) => {
    const cat = skill.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(groupedTaxonomy).sort();

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

        {/* Grouped Taxonomy Grid */}
        {!isLoading && !error && (
          <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
            {filteredTaxonomy.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 opacity-30 text-slate-400">📭</div>
                <h6 className="text-lg font-semibold text-slate-900 mb-2">No skills match your search</h6>
                <p className="text-sm text-slate-600">Try searching for "React", "js", or "Technical"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categories.map((category) => {
                  const skills = groupedTaxonomy[category];
                  
                  // Color assignment based on category
                  let colorClasses = "bg-amber-50 text-amber-700 border border-amber-200"; // fallback
                  if (category === "Technical") {
                    colorClasses = "bg-blue-50 text-blue-700 border border-blue-200";
                  } else if (category === "Soft Skill") {
                    colorClasses = "bg-purple-50 text-purple-700 border border-purple-200";
                  }

                  return (
                    <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h5 className="font-semibold text-slate-900 flex items-center gap-2">
                          {category} <span className="text-slate-400 text-xs font-normal">({skills.length})</span>
                        </h5>
                      </div>
                      <div className="p-4 flex flex-wrap gap-3">
                        {skills.map((skill, index) => (
                          <div 
                            key={index}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm flex flex-col gap-1 ${colorClasses}`}
                          >
                            <span className="font-semibold">{skill.canonical}</span>
                            {skill.aliases.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {skill.aliases.map((alias, i) => (
                                  <span key={i} className="bg-white/50 border border-black/5 text-[10px] px-1.5 py-0.5 rounded">
                                    {alias}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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