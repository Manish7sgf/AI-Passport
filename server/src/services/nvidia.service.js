const { nvidia } = require("../config/nvidia");

const MODEL = "meta/llama-3.1-8b-instruct";

async function callNvidiaWithRetry(prompt, maxTokens) {
  const extractJson = (text) => {
    // Strip markdown fences
    let cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    // Try direct parse first
    try { return JSON.parse(cleaned); } catch {}
    // Extract first JSON object or array from response
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch {} }
    throw new Error("No valid JSON found in response");
  };

  const attempt = async () => {
    const response = await nvidia.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3  // lower = more deterministic JSON output
    });
    const content = response.choices[0].message.content.trim();
    return extractJson(content);
  };

  try {
    return await attempt();
  } catch (firstErr) {
    console.warn("Nvidia NIM first attempt failed, retrying:", firstErr.message);
    try {
      return await attempt();
    } catch (secondErr) {
      console.error("Nvidia NIM second attempt failed:", secondErr.message);
      const err = new Error("AI response malformed, please try again");
      err.statusCode = 500;
      err.code = "AI_RESPONSE_ERROR";
      throw err;
    }
  }
}

const NvidiaService = {
  async predictCareers({ skills, interests }) {
    const prompt = `You are a future career analyst specialising in AI-era employment (2025–2040).

Student profile:
- Current skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}

Respond ONLY with valid JSON. No explanation. No markdown. Just the JSON object:
{
  "readiness_score": <integer 0-100>,
  "predicted_jobs": [
    {
      "title": "<job title>",
      "year_emerging": "<2026-2040>",
      "description": "<2 sentence description>",
      "fit_score": <integer 0-100>,
      "skills_needed": ["skill1", "skill2"],
      "skills_you_have": ["skill1"]
    }
  ],
  "gap_summary": "<1 sentence summary of biggest gap>",
  "top_recommendation": "<1 actionable next step>"
}
Return exactly 4 predicted_jobs. No more, no less.`;

    return callNvidiaWithRetry(prompt, 1000);
  },

  async analyseSkillGap({ skills }) {
    const prompt = `You are a workforce analytics AI. Analyse the skill gap between what a student has now vs what 2030 employers will demand.

Student current skills: ${skills.join(", ")}

Respond ONLY with valid JSON:
{
  "current_skills": [{ "name": "skill", "relevance_2030": <0-100> }],
  "future_demanded_skills": [
    { "name": "skill", "demand_score": <0-100>, "category": "technical|human|ai-collaboration" }
  ],
  "gap_percentage": <integer 0-100>,
  "missing_critical": ["skill1", "skill2"],
  "recommendations": [
    { "action": "<specific action>", "impact": "high|medium|low" }
  ]
}
Return exactly 6 future_demanded_skills and 3 recommendations.`;

    return callNvidiaWithRetry(prompt, 800);
  },

  async analyseRepo({ repoData, languages, readme }) {
    const prompt = `You are a technical project evaluator. Analyse this GitHub repository.

Repository info:
- Name: ${repoData.name || "Unknown"}
- Description: ${repoData.description || "None provided"}
- Stars: ${repoData.stargazers_count || 0}
- Languages: ${JSON.stringify(languages)}
- README excerpt: ${readme.slice(0, 800)}

Respond ONLY with this exact valid JSON (no markdown, no explanation):
{"title":"project title","description":"2 sentence description of what it does","tech_stack":["tech1","tech2","tech3"],"contribution_level":"high","contribution_reason":"one sentence reason","complexity_score":7,"skills_demonstrated":["skill1","skill2","skill3"]}

contribution_level must be exactly one of: high, medium, low
complexity_score must be an integer 1-10`;

    return callNvidiaWithRetry(prompt, 600);
  }
};

module.exports = NvidiaService;
