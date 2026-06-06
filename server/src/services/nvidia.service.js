const { nvidia } = require("../config/nvidia");

const MODEL = "meta/llama-3.1-8b-instruct";

// Robustly extract JSON from model output regardless of formatting
function extractJson(text) {
  // Strip markdown fences
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // Try direct parse
  try { return JSON.parse(cleaned); } catch {}

  // Extract first {...} block
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }

  throw new Error("No valid JSON found in AI response");
}

async function callNvidia(prompt, maxTokens) {
  const response = await nvidia.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });
  const content = response.choices[0].message.content.trim();
  return extractJson(content);
}

async function callNvidiaWithRetry(prompt, maxTokens) {
  // Attempt 1
  try {
    return await callNvidia(prompt, maxTokens);
  } catch (firstErr) {
    console.warn("Nvidia NIM attempt 1 failed:", firstErr.message);
  }

  // Attempt 2
  try {
    return await callNvidia(prompt, maxTokens);
  } catch (secondErr) {
    console.error("Nvidia NIM attempt 2 failed:", secondErr.message);
    const err = new Error("AI response malformed, please try again");
    err.statusCode = 500;
    err.code = "AI_RESPONSE_ERROR";
    throw err;
  }
}

const NvidiaService = {
  async predictCareers({ skills, interests }) {
    const prompt = `You are a future career analyst for AI-era employment 2025-2040.

Student profile:
- Skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}

Reply with ONLY a raw JSON object, no markdown, no explanation:
{"readiness_score":42,"predicted_jobs":[{"title":"AI Product Manager","year_emerging":"2028","description":"Manages AI product development cycles. Works across engineering and business teams.","fit_score":75,"skills_needed":["Product Strategy","AI Literacy"],"skills_you_have":["Python"]},{"title":"ML Engineer","year_emerging":"2027","description":"Builds and deploys machine learning models. Optimises model performance at scale.","fit_score":80,"skills_needed":["MLOps","Kubernetes"],"skills_you_have":["Python","Machine Learning"]},{"title":"AI Ethics Specialist","year_emerging":"2029","description":"Ensures responsible AI deployment. Audits models for bias and fairness.","fit_score":60,"skills_needed":["Ethics Frameworks","Policy"],"skills_you_have":["Machine Learning"]},{"title":"Data Architect","year_emerging":"2027","description":"Designs data infrastructure for AI systems. Manages pipelines and storage.","fit_score":65,"skills_needed":["Cloud","Data Engineering"],"skills_you_have":["Python","SQL"]}],"gap_summary":"Biggest gap is in MLOps and cloud infrastructure skills.","top_recommendation":"Complete an MLOps certification on Coursera."}

Now produce the SAME JSON structure but with values relevant to the student profile above. Return ONLY the JSON object.`;

    return callNvidiaWithRetry(prompt, 1200);
  },

  async analyseSkillGap({ skills }) {
    const prompt = `You are a workforce analytics AI analysing skill gaps for 2030 employers.

Student current skills: ${skills.join(", ")}

Reply with ONLY a raw JSON object, no markdown, no explanation:
{"current_skills":[{"name":"Python","relevance_2030":85}],"future_demanded_skills":[{"name":"AI Collaboration","demand_score":95,"category":"ai-collaboration"},{"name":"Cloud Computing","demand_score":90,"category":"technical"},{"name":"Data Analysis","demand_score":88,"category":"technical"},{"name":"Critical Thinking","demand_score":85,"category":"human"},{"name":"Cybersecurity","demand_score":80,"category":"technical"},{"name":"Emotional Intelligence","demand_score":75,"category":"human"}],"gap_percentage":45,"missing_critical":["Cloud Computing","Cybersecurity"],"recommendations":[{"action":"Take AWS Cloud Practitioner certification","impact":"high"},{"action":"Build a personal project using an AI API","impact":"medium"},{"action":"Join an open source project on GitHub","impact":"low"}]}

Now produce the SAME JSON structure but analysing the student's actual skills: ${skills.join(", ")}
Return exactly 6 future_demanded_skills and 3 recommendations. Return ONLY the JSON object.`;

    return callNvidiaWithRetry(prompt, 1000);
  },

  async analyseRepo({ repoData, languages, readme }) {
    const langList = Object.keys(languages).join(", ") || "Unknown";
    const prompt = `You are a technical project evaluator.

Repository: ${repoData.name || "Unknown"}
Description: ${repoData.description || "No description"}
Stars: ${repoData.stargazers_count || 0}
Languages: ${langList}
README: ${readme.slice(0, 600)}

Reply with ONLY a raw JSON object, no markdown, no explanation:
{"title":"Project Name","description":"First sentence about what it does. Second sentence about the tech approach.","tech_stack":["React","Node.js","SQLite"],"contribution_level":"high","contribution_reason":"Well-structured full-stack project with clear architecture.","complexity_score":7,"skills_demonstrated":["React","API Design","Database Design"]}

Now produce the SAME JSON structure for the repository above.
contribution_level must be exactly: high, medium, or low
complexity_score must be an integer 1-10
Return ONLY the JSON object.`;

    return callNvidiaWithRetry(prompt, 700);
  }
};

module.exports = NvidiaService;
