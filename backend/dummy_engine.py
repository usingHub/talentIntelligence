import io
import asyncio
import pdfplumber
import re

# ---------------------------------------------------------------------------
# Skills taxonomy — loaded once at startup.
# In v0.1 this is a flat dict. In the real build this becomes ChromaDB.
# ---------------------------------------------------------------------------
SKILLS_TAXONOMY = {
    # aliases → canonical name
    "js": "JavaScript", "javascript": "JavaScript",
    "reactjs": "React", "react.js": "React", "react js": "React",
    "nodejs": "Node.js", "node js": "Node.js", "node": "Node.js",
    "py": "Python", "python3": "Python",
    "k8s": "Kubernetes", "kube": "Kubernetes",
    "ml": "Machine Learning", "machine-learning": "Machine Learning",
    "dl": "Deep Learning", "deep-learning": "Deep Learning",
    "aws": "Amazon Web Services", "amazon cloud": "Amazon Web Services",
    "postgres": "PostgreSQL", "psql": "PostgreSQL",
    "ts": "TypeScript", "typescript": "TypeScript",
    "tf": "TensorFlow", "tensorflow": "TensorFlow",
    # canonical names map to themselves so lookup always works
    "react": "React", "python": "Python", "docker": "Docker",
    "kubernetes": "Kubernetes", "fastapi": "FastAPI", "mongodb": "MongoDB",
    "sql": "SQL", "git": "Git", "linux": "Linux", "redis": "Redis",
    "kafka": "Kafka", "spark": "Spark", "tableau": "Tableau",
}

# Dummy pool — Kept here safely for your Dashboard / Stats API
_CANDIDATE_POOL = [
    {
        "candidate_name": "Rahul Sharma",
        "experience_years": 3,
        "skills_found": ["Python", "FastAPI", "React", "SQL", "Docker"],
        "skills_missing": ["Kubernetes", "Redis", "System Design"],
        "overall_match_score": 82,
        "recommendation": "Strong backend profile. Recommend technical screening.",
    },
    {
        "candidate_name": "Priya Patel",
        "experience_years": 2,
        "skills_found": ["React", "Node.js", "MongoDB", "JavaScript", "CSS"],
        "skills_missing": ["TypeScript", "AWS", "GraphQL"],
        "overall_match_score": 68,
        "recommendation": "Good frontend skills. Missing cloud experience.",
    },
    {
        "candidate_name": "Arjun Mehta",
        "experience_years": 5,
        "skills_found": ["Java", "Spring Boot", "Amazon Web Services", "Kafka", "Docker"],
        "skills_missing": ["Kubernetes"],
        "overall_match_score": 91,
        "recommendation": "Excellent fit. Prioritise for interview.",
    },
    {
        "candidate_name": "Sneha Reddy",
        "experience_years": 4,
        "skills_found": ["Python", "TensorFlow", "SQL", "Pandas", "Scikit-learn"],
        "skills_missing": ["MLOps", "Spark", "Airflow"],
        "overall_match_score": 75,
        "recommendation": "Strong ML fundamentals. Limited production ML experience.",
    },
    {
        "candidate_name": "Vikram Singh",
        "experience_years": 6,
        "skills_found": ["Kubernetes", "Docker", "Linux", "Amazon Web Services", "Kafka"],
        "skills_missing": ["Prometheus", "Grafana"],
        "overall_match_score": 88,
        "recommendation": "Senior DevOps profile. Good infrastructure depth.",
    },
]


# ---------------------------------------------------------------------------
# PDF extraction — real pdfplumber, returns raw text
# ---------------------------------------------------------------------------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Real text extraction using pdfplumber.
    Returns raw text string or a safe fallback on failure.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"[dummy_engine] PDF extraction error: {e}")
        text = "Fallback: could not extract text from this file."
    return text.strip()


# ---------------------------------------------------------------------------
# Heuristics: Extract Real Name & Skills
# ---------------------------------------------------------------------------
def extract_real_name(text: str) -> str:
    """Attempts to pull the real name from the top of the document."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return "Unknown Candidate"
        
    first_line = lines[0]
    words = first_line.split()
    if len(words) <= 3:
        return first_line.title()
    return " ".join(words[:2]).title()

def extract_skills_from_text(text: str) -> list[str]:
    """Scans the document for actual skills based on the taxonomy."""
    text_lower = text.lower()
    found_skills = []
    
    for alias, canonical in SKILLS_TAXONOMY.items():
        # Word boundary regex to prevent "ts" matching inside "responsibilities"
        pattern = r'\b' + re.escape(alias.lower()) + r'\b'
        if re.search(pattern, text_lower) and canonical not in found_skills:
            found_skills.append(canonical)
            
    return found_skills

def normalize_skills(raw_skills: list[str]) -> list[str]:
    """Maps raw skill strings to canonical taxonomy names."""
    normalized = []
    for skill in raw_skills:
        key = skill.lower().strip()
        canonical = SKILLS_TAXONOMY.get(key, skill)
        if canonical not in normalized:
            normalized.append(canonical)
    return normalized


# ---------------------------------------------------------------------------
# Single resume analysis — async so FastAPI never blocks
# ---------------------------------------------------------------------------
async def generate_dummy_parse_report(
    source_text: str,
    file_index: int = 0,
) -> dict:
    """
    Async dummy parse. NOW EXTRACTS REAL DATA from the uploaded document
    instead of relying on the hardcoded candidate pool.
    """
    await asyncio.sleep(1.2)  # non-blocking simulation of ML processing

    real_name = extract_real_name(source_text)
    real_skills = extract_skills_from_text(source_text)

    return {
        "candidate_name": real_name,
        "experience_years": 3, # Hardcoded default for v0.1 since ML is needed for this
        "skills_found": real_skills,
        "skills_missing": [], # Blank initially, calculated during Match phase
        "overall_match_score": None, # Blank initially, calculated during Match phase
        "recommendation": "Document parsed successfully. Run Match Engine to see role fit.",
        "extracted_text_preview": (
            source_text[:120] + "..." if len(source_text) > 120 else source_text
        ),
        "agent_trace": {
            "parse_agent": "completed",
            "normalize_agent": "completed",
            "match_agent": "pending",
        },
    }


# ---------------------------------------------------------------------------
# Job match report — called by /api/v1/match endpoint
# ---------------------------------------------------------------------------
async def generate_dummy_match_report(
    candidate_skills: list[str],
    job_description: str,
) -> dict:
    """
    Async match. Scans job description for taxonomy skills using word-boundary
    matching, compares against candidate profile, returns a real dynamic score.
    """
    await asyncio.sleep(0.8)

    normalized_candidate = normalize_skills(candidate_skills)
    job_desc_lower = job_description.lower()

    required_skills = []
    for alias, canonical in SKILLS_TAXONOMY.items():
        pattern = r'\b' + re.escape(alias.lower()) + r'\b'
        if re.search(pattern, job_desc_lower) and canonical not in required_skills:
            required_skills.append(canonical)

    if not required_skills:
        return {
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "gap_analysis": "No recognized technical skills found in the job description.",
            "recommendation": "Please specify required skills like Python, React, or Docker.",
        }

    matched = [s for s in required_skills if s in normalized_candidate]
    missing = [s for s in required_skills if s not in normalized_candidate]

    score = int((len(matched) / len(required_skills)) * 100)

    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "gap_analysis": (
            f"Candidate matches {len(matched)} of {len(required_skills)} required skills. "
            f"Missing: {', '.join(missing)}."
            if missing
            else "Candidate meets all extracted skill requirements."
        ),
        "recommendation": (
            "Strong fit — recommend for interview." if score >= 80
            else "Partial fit — consider for junior role." if score >= 50
            else "Skill gap too large for this role."
        ),
    }

# ---------------------------------------------------------------------------
# Batch processing — processes list of (bytes, filename) pairs concurrently
# ---------------------------------------------------------------------------
async def process_batch(files: list[tuple[bytes, str]]) -> list[dict]:
    """
    Processes multiple resumes concurrently using asyncio.gather.
    Demonstrates the orchestration layer handling parallel workloads.
    """
    tasks = [
        generate_dummy_parse_report(
            extract_text_from_pdf(file_bytes),
            file_index=i,
        )
        for i, (file_bytes, _filename) in enumerate(files)
    ]
    results = await asyncio.gather(*tasks)
    return [
        {"filename": files[i][1], "status": "processed", "data": result}
        for i, result in enumerate(results)
    ]