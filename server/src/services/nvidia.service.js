const { nvidia } = require("../config/nvidia");

const MODEL = "meta/llama-3.1-70b-instruct";

async function callNvidiaWithRetry(prompt, maxTokens) {
  const attempt = async () => {
    const response = await nvidia.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    const content = response.choices[0].message.content.trim();
    // Strip markdown fences if model returns them despite instructions
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    return JSON.parse(cleaned);
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
    const prompt = `You are a technical project evaluator. Analyse this GitHub repository and assess the student's contribution.

Repository info:
- Name: ${repoData.name || "Unknown"}
- Description: ${repoData.description || "None provided"}
- Stars: ${repoData.stargazers_count || 0}
- Languages: ${JSON.stringify(languages)}
- README (first 2000 chars): ${readme}

Respond ONLY with valid JSON:
{
  "title": "<clean project title>",
  "description": "<2 sentence summary of what the project does>",
  "tech_stack": ["tech1", "tech2"],
  "contribution_level": "high|medium|low",
  "contribution_reason": "<1 sentence why you rated it that level>",
  "complexity_score": <1-10>,
  "skills_demonstrated": ["skill1", "skill2", "skill3"]
}`;

    return callNvidiaWithRetry(prompt, 600);
  }
};

module.exports = NvidiaService;
