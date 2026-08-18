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
    lang_list = ", ".join(list(languages.keys())[:5]) or "Unknown"
    readme_excerpt = (readme or "")[:500]
    prompt = f"""You are a technical project evaluator.
Repo: {repo_data.get("name", "Unknown")}
Description: {repo_data.get("description") or "No description"}
Languages: {lang_list}
README: {readme_excerpt}

Return ONLY valid JSON with this exact structure (no explanation, no markdown):
{{"title":"Project Name","description":"First sentence what it does. Second sentence the tech approach.","tech_stack":["React","Node.js","PostgreSQL"],"contribution_level":"high","contribution_reason":"Well-structured full-stack project with clear architecture.","complexity_score":7,"skills_demonstrated":["React","API Design","Database Design"]}}

Now return the SAME JSON structure for the repository above.
contribution_level must be exactly one of: high, medium, low
complexity_score must be integer 1-10
Return ONLY the JSON."""
    return _call_with_retry(prompt, 600)
