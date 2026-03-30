import React, { useState } from "react";

export default function ExtensionSetup() {
  // We need this state to handle the button's "Downloading..." text!
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create an invisible link to trigger the browser's native download
    const link = document.createElement('a');
    link.href = '/talentai-extension.zip'; // Points to your public folder
    link.download = 'talentai-extension.zip'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset the button text after a short delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      
      {/* ── Header ── */}
      <div className="mb-5 text-center">
        <div className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded p-3 mb-3 shadow-sm" style={{ width: 64, height: 64 }}>
          <span className="fs-2">🧩</span>
        </div>
        <h2 className="fw-bold">TalentIQ Sourcing Extension</h2>
        <p className="text-muted fs-5 mb-4">Zero-friction AI sourcing directly on LinkedIn and Wellfound.</p>
        <button 
          className="btn btn-primary btn-lg px-5 shadow-sm rounded-pill fw-semibold"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading ZIP..." : "↓ Download Extension (Beta)"}
        </button>
      </div>

      <div className="row justify-content-center g-4">
        
        {/* ── Left Card: Features ── */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">✨ Key Features</h5>
              
              <div className="d-flex gap-3 mb-4">
                <div className="fs-3">🪄</div>
                <div>
                  <h6 className="fw-semibold mb-1">One-Click Auto-Scraping</h6>
                  <p className="text-muted small mb-0">Securely extracts visible profile text without manual highlighting. Bypasses rigid DOM structures instantly.</p>
                </div>
              </div>

              <div className="d-flex gap-3 mb-4">
                <div className="fs-3">⚡</div>
                <div>
                  <h6 className="fw-semibold mb-1">Zero-Latency Architecture</h6>
                  <p className="text-muted small mb-0">Built entirely in Vanilla JS. No React bloat, just native browser performance hitting our FastAPI backend.</p>
                </div>
              </div>

              <div className="d-flex gap-3 mb-4">
                <div className="fs-3">🧠</div>
                <div>
                  <h6 className="fw-semibold mb-1">Explainable AI (XAI) UI</h6>
                  <p className="text-muted small mb-0">Generates visual Gap Analysis right in the browser, tagging Verified Skills and Gaps alongside AI deduction.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Right Card: Instructions ── */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm bg-dark text-white h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-primary">Developer Mode Installation</h5>
              <p className="small text-white-50 mb-4">Because this is a prototype, it runs as an "unpacked" local extension.</p>
              
              <ol className="list-group list-group-numbered list-group-flush border-0">
                <li className="list-group-item bg-transparent text-white border-white-50 py-3">
                  Download and unzip the extension folder using the button above.
                </li>
                <li className="list-group-item bg-transparent text-white border-white-50 py-3">
                  Open Chrome and navigate to <code className="bg-dark border rounded px-2 py-1 mx-1 text-info">chrome://extensions/</code>
                </li>
                <li className="list-group-item bg-transparent text-white border-white-50 py-3">
                  Toggle <strong>Developer mode</strong> to <strong>ON</strong> in the top right corner.
                </li>
                <li className="list-group-item bg-transparent text-white border-white-50 py-3">
                  Click the <span className="badge bg-light text-dark mx-1">Load unpacked</span> button in the top left.
                </li>
                <li className="list-group-item bg-transparent text-white border-0 py-3">
                  Select the unzipped folder, then pin the 🧩 icon to your toolbar!
                </li>
              </ol>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}