

***

```markdown
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
```

---

## 🚀 Installation Guide (Developer Mode)

Because this is a developer prototype, it is loaded as an "unpacked" extension.

1. Clone this repository or download the `chrome-extension` folder to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. In the top right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top left corner.
5. Select the `chrome-extension` directory.
6. 🧩 Click the puzzle piece icon in your Chrome toolbar and **Pin** the TalentAI logo.

---

## 💻 Usage & Workflow

1. Navigate to a candidate's profile (e.g., a LinkedIn page).
2. Open the TalentAI extension popup.
3. Select the target **Job Requisition** from the dropdown menu.
4. Click **Scan Candidate Profile**.
5. The extension will scrape the page, hit the local AI backend, and return the semantic match score and gap analysis in < 5 seconds.

---

## 🔌 API Contract (Backend Integration)

The extension communicates with the central TalentAI FastAPI backend. It expects the server to be running locally at `http://localhost:8000`. 

**Request Payload (`POST /api/v1/match`):**
```json
{
  "candidate_text": "[Raw scraped text string]",
  "target_role": "Senior Data Scientist"
}
```

**Expected Response Payload:**
```json
{
  "score": 87,
  "strong_matches": ["Python", "FastAPI"],
  "missing_skills": ["Kubernetes"],
  "ai_deduction": "String explaining the contextual match logic."
}
```

> **Note:** The backend must have `CORSMiddleware` configured to accept cross-origin requests, otherwise Chrome will block the fetch call.

---
**Maintained by Pratik Parihar** | Built for Tic Tech Toe'26
```

***
