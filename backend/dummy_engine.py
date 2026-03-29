import pdfplumber
import time
import json

def extract_text_from_pdf(file_bytes):
    """Real extraction using pdfplumber to prove the pipeline works."""
    text = ""
    try:
        # We process the raw bytes directly from the API upload
        import io
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        text = "Fallback text due to extraction error."
    return text

def generate_dummy_match_report(source_text, job_description=""):
    """
    The 'Smoke and Mirrors' function. 
    It sleeps for 1.5 seconds to simulate ML processing, 
    then returns a highly realistic, hardcoded JSON response.
    """
    time.sleep(1.5) # Simulate AI thinking
    
    # In a real app, you'd compare source_text against skills.json here.
    # For v0.1, we return the exact API contract you and your teammate need.
    return {
        "candidate_name": "Alex Mercer",
        "overall_match_score": 85,
        "skills_found": ["React", "Python", "FastAPI", "MongoDB"],
        "skills_missing": ["Kubernetes", "AWS"],
        "experience_years": 4,
        "recommendation": "Strong candidate. Move to technical screening.",
        "extracted_text_preview": source_text[:100] + "..." # Prove we read it!
    }