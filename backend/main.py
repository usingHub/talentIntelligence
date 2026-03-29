from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from dummy_engine import extract_text_from_pdf, generate_dummy_match_report

app = FastAPI(
    title="API-Ready Talent Intelligence",
    description="Backend for PS 9: Chrome Extension and Web Dashboard",
    version="0.1"
)

# Crucial: Allow both your local React app and the Chrome Extension to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Fine for hackathon prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ENDPOINT 1: For the Web Interface (PDF Upload)
# ---------------------------------------------------------
@app.post("/api/web/parse-resume")
async def parse_resume_upload(
    file: UploadFile = File(...), 
    job_description: str = Form(default="")
):
    # 1. Read the uploaded PDF file
    file_bytes = await file.read()
    
    # 2. Extract text using our real pdfplumber logic
    extracted_text = extract_text_from_pdf(file_bytes)
    
    # 3. Generate the dummy analysis report
    report = generate_dummy_match_report(extracted_text, job_description)
    
    return {
        "status": "success",
        "source": "pdf_upload",
        "data": report
    }

# ---------------------------------------------------------
# ENDPOINT 2: For the Chrome Extension (JSON Text payload)
# ---------------------------------------------------------
@app.post("/api/extension/parse-profile")
async def parse_linkedin_profile(
    payload: dict = Body(..., example={"profile_text": "Software Engineer with 4 years...", "job_description": ""})
):
    # 1. Extract text directly from the JSON payload
    profile_text = payload.get("profile_text", "")
    job_description = payload.get("job_description", "")
    
    # 2. Generate the dummy analysis report
    report = generate_dummy_match_report(profile_text, job_description)
    
    return {
        "status": "success",
        "source": "chrome_extension",
        "data": report
    }