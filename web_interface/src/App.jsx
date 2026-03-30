import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

// these will be added as we build each page
import Upload from "./pages/Upload";
import CandidateProfile from "./pages/CandidateProfile";
import TaxonomyBrowser from "./pages/TaxonomyBrowser";
import ExtensionSetup from "./pages/ExtensionSetup";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/candidate/:id" element={<CandidateProfile />} />
            <Route path="/taxonomy" element={<TaxonomyBrowser />} />
            <Route path="/extension" element={<ExtensionSetup />} />
            
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}