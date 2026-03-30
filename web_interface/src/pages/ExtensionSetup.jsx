import React, { useState } from "react";

export default function ExtensionSetup() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    const link = document.createElement('a');
    link.href = '/talentai-extension.zip';
    link.download = 'talentai-extension.zip'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12">
      
      {/* ── Header ── */}
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="flex items-center justify-center bg-indigo-600 text-white rounded-2xl shadow-md w-16 h-16 mb-6">
          <span className="text-3xl">🧩</span>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
          TalentIQ Sourcing Extension
        </h2>
        <p className="text-slate-600 text-lg mb-8 max-w-2xl">
          Zero-friction AI sourcing directly on LinkedIn and Wellfound.
        </p>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all disabled:bg-indigo-400 disabled:shadow-none disabled:transform-none text-lg"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading ZIP..." : "↓ Download Extension (Beta)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── Left Card: Features ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <div className="p-8">
            <h5 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <span className="text-slate-400">✨</span> Key Features
            </h5>
            
            <div className="flex gap-4 mb-8">
              <div className="text-3xl shrink-0 mt-1">🪄</div>
              <div>
                <h6 className="font-semibold text-slate-900 mb-1">One-Click Auto-Scraping</h6>
                <p className="text-slate-600 text-sm leading-relaxed">Securely extracts visible profile text without manual highlighting. Bypasses rigid DOM structures instantly.</p>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="text-3xl shrink-0 mt-1">⚡</div>
              <div>
                <h6 className="font-semibold text-slate-900 mb-1">Zero-Latency Architecture</h6>
                <p className="text-slate-600 text-sm leading-relaxed">Built entirely in Vanilla JS. No React bloat, just native browser performance hitting our FastAPI backend.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl shrink-0 mt-1">🧠</div>
              <div>
                <h6 className="font-semibold text-slate-900 mb-1">Explainable AI (XAI) UI</h6>
                <p className="text-slate-600 text-sm leading-relaxed">Generates visual Gap Analysis right in the browser, tagging Verified Skills and Gaps alongside AI deduction.</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Right Card: Instructions (Visually Balanced) ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <div className="p-8">
            <h5 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-slate-400">🛠️</span> Developer Mode Setup
            </h5>
            <p className="text-slate-600 text-sm mb-8">
              Because this is a prototype, it runs as an "unpacked" local extension.
            </p>
            
            <ol className="list-decimal list-outside ml-5 space-y-6 text-slate-700 text-sm marker:text-slate-400 marker:font-semibold">
              <li className="pl-2 leading-relaxed">
                Download and unzip the extension folder using the button above.
              </li>
              <li className="pl-2 leading-relaxed">
                Open Chrome and navigate to 
                <code className="bg-slate-100 text-slate-600 font-mono text-xs px-2 py-1 rounded ml-1.5 border border-slate-200">chrome://extensions/</code>
              </li>
              <li className="pl-2 leading-relaxed">
                Toggle <strong className="font-semibold text-slate-900">Developer mode</strong> to <strong className="font-semibold text-slate-900">ON</strong> in the top right corner.
              </li>
              <li className="pl-2 leading-relaxed">
                Click the 
                <span className="bg-white border border-slate-200 text-slate-700 font-medium px-2 py-1 rounded text-xs shadow-sm mx-1.5">Load unpacked</span> 
                button in the top left.
              </li>
              <li className="pl-2 leading-relaxed">
                Select the unzipped folder, then pin the <span className="text-base mx-1">🧩</span> icon to your toolbar!
              </li>
            </ol>

          </div>
        </div>

      </div>
    </div>
  );
}