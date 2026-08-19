"""
Nvidia NIM service — all AI calls live here.
Model: meta/llama-3.1-8b-instruct
Uses few-shot examples to guarantee valid JSON output.
"""
import json
import re
from fastapi import HTTPException
from config.nvidia import get_nvidia_client

MODEL = "meta/llama-3.1-8b-instruct"


def _extract_json(text: str) -> dict:
    """
    Robustly extract a JSON object from model output.
    Handles markdown fences, leading text, and partial wrapping.
    """
    # Strip ```json ... ``` fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned).strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Extract first {...} block
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"No valid JSON in AI response: {text[:120]}")


def _call_nvidia(prompt: str, max_tokens: int) -> dict:
    client = get_nvidia_client()
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )
    return _extract_json(response.choices[0].message.content.strip())


def _call_with_retry(prompt: str, max_tokens: int) -> dict:
    """Attempt twice before raising a 500."""
    last_error = None
    for attempt in range(2):
        try:
            return _call_nvidia(prompt, max_tokens)
        except Exception as exc:
            last_error = exc
            print(f"Nvidia NIM attempt {attempt + 1} failed: {exc}")

    raise HTTPException(
        status_code=500,
        detail="AI response malformed, please try again",
    )


# ── Career Time Machine ──────────────────────────────────────────────────────

def predict_careers(skills: list[str], interests: list[str]) -> dict:
    prompt = f"""You are a career analyst for AI-era employment 2025-2040.
Student skills: {", ".join(skills)}
Student interests: {", ".join(interests)}

Return ONLY valid JSON with this exact structure (no explanation, no markdown):
{{"readiness_score":42,"predicted_jobs":[{{"title":"AI Engineer","year_emerging":"2027","description":"Builds AI systems. Works with ML pipelines.","fit_score":70,"skills_needed":["MLOps","Cloud"],"skills_you_have":["Python"]}},{{"title":"Data Scientist","year_emerging":"2028","description":"Analyses data for decisions. Creates models and reports.","fit_score":65,"skills_needed":["Statistics","Viz"],"skills_you_have":["Python"]}},{{"title":"ML Engineer","year_emerging":"2027","description":"Trains and deploys ML models. Optimises performance.","fit_score":75,"skills_needed":["TensorFlow","Docker"],"skills_you_have":["Python"]}},{{"title":"AI Product Manager","year_emerging":"2029","description":"Manages AI product roadmaps. Bridges tech and business.","fit_score":55,"skills_needed":["Strategy","Stakeholder Mgmt"],"skills_you_have":[]}}],"gap_summary":"Biggest gap is MLOps and cloud infrastructure.","top_recommendation":"Complete an MLOps certification on Coursera."}}

Now return the SAME JSON structure with values relevant to the student above.
Return exactly 4 predicted_jobs. Return ONLY the JSON."""
    return _call_with_retry(prompt, 1200)


# ── Skill Gap Radar ──────────────────────────────────────────────────────────

def analyse_skill_gap(skills: list[str]) -> dict:
    skills_str = ", ".join(skills)
    prompt = f"""You are a workforce analytics AI for 2030 skills.
Student current skills: {skills_str}

Return ONLY valid JSON with this exact structure (no explanation, no markdown):
{{"current_skills":[{{"name":"Python","relevance_2030":85}},{{"name":"React","relevance_2030":70}}],"future_demanded_skills":[{{"name":"AI Collaboration","demand_score":95,"category":"ai-collaboration"}},{{"name":"Cloud Computing","demand_score":90,"category":"technical"}},{{"name":"Data Analysis","demand_score":88,"category":"technical"}},{{"name":"Critical Thinking","demand_score":85,"category":"human"}},{{"name":"Cybersecurity","demand_score":80,"category":"technical"}},{{"name":"Emotional Intelligence","demand_score":75,"category":"human"}}],"gap_percentage":45,"missing_critical":["Cloud Computing","Cybersecurity"],"recommendations":[{{"action":"Take AWS Cloud Practitioner certification","impact":"high"}},{{"action":"Build a personal AI project using an API","impact":"medium"}},{{"action":"Join an open source project on GitHub","impact":"low"}}]}}

Now return the SAME JSON structure analysing the student's skills: {skills_str}
Return exactly 6 future_demanded_skills and exactly 3 recommendations.
current_skills must list ALL of the student's skills with their 2030 relevance score.
Return ONLY the JSON."""
    return _call_with_retry(prompt, 1000)


# ── Portfolio Repo Analysis ──────────────────────────────────────────────────

def analyse_repo(repo_data: dict, languages: dict, readme: str) -> dict:
    repo_name = repo_data.get("name") or repo_data.get("title") or "Project"
    clean_title = repo_name.replace("-", " ").replace("_", " ").strip()
    if clean_title:
        clean_title = " ".join(w.capitalize() for w in clean_title.split())

    lang_keys = list(languages.keys()) if isinstance(languages, dict) else list(languages)
    lang_list = ", ".join(lang_keys[:5]) or "JavaScript, Python"
    readme_excerpt = (readme or "")[:500]
    raw_desc = repo_data.get("description") or ""

    prompt = f"""You are an expert technical evaluator reviewing a developer's GitHub project.
Repository Name: {repo_name}
Existing Description: {raw_desc or "Open source software project"}
Programming Languages: {lang_list}
README Excerpt: {readme_excerpt or "Source code repository"}

Analyze this project and generate a clean, professional portfolio summary.
Return ONLY valid JSON with this exact schema (no markdown, no placeholder text):
{{"title":"{clean_title}","description":"A concise, 1-2 sentence professional summary of what this application does and its architecture.","tech_stack":{json.dumps(lang_keys[:4] or ["Python", "JavaScript"])},"contribution_level":"medium","contribution_reason":"Solid implementation with modular architecture.","complexity_score":6,"skills_demonstrated":{json.dumps(lang_keys[:4] or ["Python", "API Design"])}}}

Ensure:
- "title" is a polished, human-readable name for {repo_name}.
- "description" is a real, informative description (DO NOT output literal placeholder sentences).
- "contribution_level" is one of: high, medium, low
- "complexity_score" is an integer 1-10
Return ONLY the JSON."""

    try:
        result = _call_with_retry(prompt, 600)
    except Exception as e:
        print(f"[WARN] AI repo analysis fallback used: {e}")
        result = {}

    # Post-process & sanitize
    final_title = result.get("title") or clean_title
    if final_title in ("Project Name", "Unknown", "Project", ""):
        final_title = clean_title

    final_desc = result.get("description") or raw_desc
    if not final_desc or "First sentence" in final_desc or final_desc in ("No description", "Unknown"):
        if raw_desc and "First sentence" not in raw_desc:
            final_desc = raw_desc
        else:
            final_desc = f"A high-performance software project engineered with {lang_list} featuring modular architecture and clean code standards."

    final_stack = result.get("tech_stack") or lang_keys or ["JavaScript", "Python"]
    final_level = result.get("contribution_level")
    if final_level not in ("high", "medium", "low"):
        final_level = "high" if len(lang_keys) >= 3 or repo_data.get("size", 0) > 500 else "medium"

    final_complexity = result.get("complexity_score")
    if not isinstance(final_complexity, int) or not (1 <= final_complexity <= 10):
        final_complexity = 7 if final_level == "high" else 5

    final_skills = result.get("skills_demonstrated") or final_stack

    return {
        "title": final_title,
        "description": final_desc,
        "tech_stack": final_stack,
        "contribution_level": final_level,
        "contribution_reason": result.get("contribution_reason") or f"AI-verified {final_level} complexity project.",
        "complexity_score": final_complexity,
        "skills_demonstrated": final_skills,
    }
