# 🧩 TalentAI Sourcing Extension (Beta)

**Zero-Friction AI Sourcing directly in your browser.**

The TalentAI Chrome Extension is the sourcing client for the TalentAI Ecosystem. Built with vanilla web technologies for zero latency and zero build-time overhead, it allows recruiters to instantly evaluate candidate profiles on job boards like LinkedIn and Wellfound using a Multi-Agent AI backend.

---

## ✨ Key Features

* **🪄 One-Click Auto-Scraping:** Bypasses rigid DOM structures to securely extract visible profile text without requiring the recruiter to manually highlight anything.
* **⚡ Zero-Latency Architecture:** Built entirely in Vanilla JavaScript, HTML, and CSS. No Webpack, no React bloat—just native browser performance.
* **UI/UX Micro-Interactions:** Features a sleek Slate-900 dark mode, precision execution timers, and animated conic-gradient progress circles.
* **🛡️ Demo-Resilient Fallback:** Includes a silent failure-catch system. If the local FastAPI backend is unreachable, the extension seamlessly falls back to high-fidelity mock data to ensure live demos never break.
* **🧠 Explainable AI (XAI) UI:** Generates a visual Gap Analysis, clearly tagging Verified Skills (Green) and Skill Gaps (Red) alongside a contextual AI deduction paragraph.

---

## 📂 File Structure

This extension utilizes Manifest V3 and requires zero build steps. 

```text
chrome-extension/
├── icons/                 # Extension toolbar icons (16px, 48px, 128px)
├── manifest.json          # Chrome V3 Configuration & Permissions
├── popup.html             # The Main UI structure
├── popup.css              # Dark mode styling and CSS animations
├── popup.js               # State management, API logic, and UI rendering
└── content.js             # The scraper script injected into host web pages