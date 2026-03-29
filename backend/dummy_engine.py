import io
import asyncio
import pdfplumber

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

# Dummy pool — used to build per-file varied responses
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
# Skill normalisation — even in v0.1 this shows the concept working
# ---------------------------------------------------------------------------
def normalize_skills(raw_skills: list[str]) -> list[str]:
    """
    Maps raw skill strings to canonical taxonomy names.
    Demonstrates the normalisation agent concept without real embeddings.
    """
    normalized = []
    for skill in raw_skills:
        key = skill.lower().strip()
        canonical = SKILLS_TAXONOMY.get(key, skill)  # fallback to original
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
    Async dummy parse. Uses file_index to cycle through the candidate pool
    so each uploaded file returns a different result — looks realistic in demo.
    Simulates AI processing delay without blocking the event loop.
    """
    await asyncio.sleep(1.2)  # non-blocking simulation of ML processing

    candidate = _CANDIDATE_POOL[file_index % len(_CANDIDATE_POOL)]

    # Normalize the dummy skills to show the taxonomy agent working
    normalized_skills = normalize_skills(candidate["skills_found"])

    return {
        "candidate_name": candidate["candidate_name"],
        "experience_years": candidate["experience_years"],
        "skills_found": normalized_skills,
        "skills_missing": candidate["skills_missing"],
        "overall_match_score": candidate["overall_match_score"],
        "recommendation": candidate["recommendation"],
        "extracted_text_preview": (
            source_text[:120] + "..." if len(source_text) > 120 else source_text
        ),
        "agent_trace": {
            "parse_agent": "completed",
            "normalize_agent": "completed",
            "match_agent": "completed",
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
    Async dummy match. Normalises candidate skills then returns
    a realistic match breakdown.
    """
    await asyncio.sleep(0.8)

    normalized = normalize_skills(candidate_skills)

    # Dummy logic: skills in our pool that aren't in candidate list = missing
    all_possible = ["Python", "React", "Docker", "Kubernetes",
                    "FastAPI", "SQL", "Redis", "TypeScript", "AWS"]
    missing = [s for s in all_possible if s not in normalized][:3]
    score = max(40, 100 - (len(missing) * 8))

    return {
        "match_score": score,
        "matched_skills": normalized,
        "missing_skills": missing,
        "gap_analysis": (
            f"Candidate matches {len(normalized)} required skills. "
            f"Missing: {', '.join(missing)}." if missing
            else "Candidate meets all skill requirements."
        ),
        "recommendation": (
            "Strong fit — recommend for interview." if score >= 80
            else "Partial fit — consider for junior role." if score >= 60
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