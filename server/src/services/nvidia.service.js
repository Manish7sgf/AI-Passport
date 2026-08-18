const { nvidia } = require("../config/nvidia");

const MODEL = "meta/llama-3.1-8b-instruct";

function extractJson(text) {
  let s = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  throw new Error("No valid JSON found in AI response: " + s.slice(0, 100));
}

async function callNvidia(prompt, maxTokens) {
  const response = await nvidia.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1
  });
  return extractJson(response.choices[0].message.content.trim());
}

async function callNvidiaWithRetry(prompt, maxTokens) {
  try {
    return await callNvidia(prompt, maxTokens);
  } catch (e1) {
    console.warn("Nvidia NIM attempt 1 failed:", e1.message);
    try {
      return await callNvidia(prompt, maxTokens);
    } catch (e2) {
      console.error("Nvidia NIM attempt 2 failed:", e2.message);
      const err = new Error("AI response malformed, please try again");
      err.statusCode = 500;
      err.code = "AI_RESPONSE_ERROR";
      throw err;
    }
  }
}

const NvidiaService = {
  async predictCareers({ skills, interests }) {
    const prompt = `You are a career analyst for AI-era employment 2025-2040.
Student skills: ${skills.join(", ")}
Student interests: ${interests.join(", ")}

Return ONLY valid JSON with this exact structure (no explanation, no markdown):
{"readiness_score":42,"predicted_jobs":[{"title":"AI Engineer","year_emerging":"2027","description":"Builds AI systems. Works with ML pipelines.","fit_score":70,"skills_needed":["MLOps","Cloud"],"skills_you_have":["Python"]},{"title":"Data Scientist","year_emerging":"2028","description":"Analyses data for decisions. Creates models and reports.","fit_score":65,"skills_needed":["Statistics","Viz"],"skills_you_have":["Python"]},{"title":"ML Engineer","year_emerging":"2027","description":"Trains and deploys ML models. Optimises performance.","fit_score":75,"skills_needed":["TensorFlow","Docker"],"skills_you_have":["Python"]},{"title":"AI Product Manager","year_emerging":"2029","description":"Manages AI product roadmaps. Bridges tech and business.","fit_score":55,"skills_needed":["Strategy","Stakeholder Mgmt"],"skills_you_have":[]}],"gap_summary":"Biggest gap is MLOps and cloud infrastructure.","top_recommendation":"Complete an MLOps certification on Coursera."}

Now return the SAME JSON structure with values relevant to the student above. Return exactly 4 predicted_jobs. Return ONLY the JSON.`;

    return callNvidiaWithRetry(prompt, 1200);
  },

  async analyseSkillGap({ skills }) {
    const prompt = `You are a workforce analytics AI for 2030 skills.
Student current skills: ${skills.join(", ")}

Return ONLY valid JSON with this exact structure (no explanation, no markdown):
{"current_skills":[{"name":"Python","relevance_2030":85},{"name":"React","relevance_2030":70}],"future_demanded_skills":[{"name":"AI Collaboration","demand_score":95,"category":"ai-collaboration"},{"name":"Cloud Computing","demand_score":90,"category":"technical"},{"name":"Data Analysis","demand_score":88,"category":"technical"},{"name":"Critical Thinking","demand_score":85,"category":"human"},{"name":"Cybersecurity","demand_score":80,"category":"technical"},{"name":"Emotional Intelligence","demand_score":75,"category":"human"}],"gap_percentage":45,"missing_critical":["Cloud Computing","Cybersecurity"],"recommendations":[{"action":"Take AWS Cloud Practitioner certification","impact":"high"},{"action":"Build a personal AI project using an API","impact":"medium"},{"action":"Join an open source project on GitHub","impact":"low"}]}

Now return the SAME JSON structure analysing the student's skills: ${skills.join(", ")}
Return exactly 6 future_demanded_skills and exactly 3 recommendations.
current_skills must list ALL of the student's skills with their 2030 relevance score.
Return ONLY the JSON.`;

    return callNvidiaWithRetry(prompt, 1000);
  },

  async analyseRepo({ repoData, languages, readme }) {
    const langList = Object.keys(languages).slice(0, 5).join(", ") || "Unknown";
    const prompt = `You are a technical project evaluator.
Repo: ${repoData.name || "Unknown"}
Description: ${repoData.description || "No description"}
Languages: ${langList}
README: ${readme.slice(0, 500)}

Return ONLY valid JSON with this exact structure (no explanation, no markdown):
{"title":"Project Name","description":"First sentence what it does. Second sentence the tech approach.","tech_stack":["React","Node.js","SQLite"],"contribution_level":"high","contribution_reason":"Well-structured full-stack project with clear architecture.","complexity_score":7,"skills_demonstrated":["React","API Design","Database Design"]}

Now return the SAME JSON structure for the repository above.
contribution_level must be exactly one of: high, medium, low
complexity_score must be integer 1-10
Return ONLY the JSON.`;

    return callNvidiaWithRetry(prompt, 600);
  }
};

module.exports = NvidiaService;
