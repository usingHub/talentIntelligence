import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

// these will be added as we build each page
// import Upload from "./pages/Upload";
// import CandidateProfile from "./pages/CandidateProfile";
// import TaxonomyBrowser from "./pages/TaxonomyBrowser";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-light">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* uncomment as we build each page:
            <Route path="/upload" element={<Upload />} />
            <Route path="/candidate/:id" element={<CandidateProfile />} />
            <Route path="/taxonomy" element={<TaxonomyBrowser />} />
            */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}