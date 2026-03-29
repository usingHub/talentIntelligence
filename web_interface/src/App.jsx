import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    // Prepare the file to be sent to FastAPI
    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', 'Looking for a Full Stack Developer with React and Python experience.')

    try {
      // Hitting your local FastAPI server
      const response = await fetch('http://127.0.0.1:8000/api/web/parse-resume', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      setResult(data.data) // The dummy engine report
    } catch (error) {
      console.error("Error parsing resume:", error)
      alert("Failed to connect to the backend. Is FastAPI running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">API-Ready Talent Intelligence</span>
          <span className="text-light opacity-75">HR Processing Dashboard</span>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          
          {/* Upload Column */}
          <div className="col-md-5 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center d-flex flex-column justify-content-center align-items-center p-5">
                <h5 className="card-title mb-4">Upload Resume (PDF)</h5>
                
                <input 
                  type="file" 
                  className="form-control mb-3" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                
                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleUpload}
                  disabled={!file || loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Parsing with AI Engine...
                    </>
                  ) : (
                    'Process Candidate'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="col-md-7 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h5 className="card-title">Analysis Output</h5>
              </div>
              <div className="card-body">
                {!result && !loading && (
                  <div className="text-center text-muted mt-5">
                    <p>Upload a resume to see the extracted data and match score.</p>
                  </div>
                )}

                {result && (
                  <div className="animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="text-primary mb-0">{result.candidate_name}</h3>
                      <span className={`badge rounded-pill fs-5 ${result.overall_match_score > 75 ? 'bg-success' : 'bg-warning'}`}>
                        {result.overall_match_score}% Match
                      </span>
                    </div>
                    
                    <p className="text-muted border-bottom pb-3">{result.recommendation}</p>

                    <div className="row mb-3">
                      <div className="col-6">
                        <h6 className="text-success">Skills Verified</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {result.skills_found.map((skill, index) => (
                            <span key={index} className="badge bg-success bg-opacity-10 text-success border border-success">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="col-6">
                        <h6 className="text-danger">Skills Missing</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {result.skills_missing.map((skill, index) => (
                            <span key={index} className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-light p-3 rounded mt-4">
                      <small className="text-muted fw-bold d-block mb-2">Raw Text Extraction Preview (pdfplumber):</small>
                      <code className="text-light" style={{ fontSize: '0.8rem' }}>
                        {result.extracted_text_preview}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App