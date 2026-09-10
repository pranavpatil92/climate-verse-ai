// ai/openai.js
// OpenAI client wrapping both Gemini-compatible prompts A and B.
// Using OpenAI API (key provided). To switch to Gemini, replace client + model.

const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── PROMPT A — Explainable AI Recommendation Engine ───────────────────────
const RECOMMENDATION_SYSTEM_PROMPT = `You are the Explainable AI Recommendation Engine inside ClimateVerse AI, serving Pune, Maharashtra. You receive a JSON payload with current weather, historical context, and computed risk scores (heat_risk, flood_risk, air_quality_risk, drought_risk, overall_risk, risk_level).

Return ONLY valid JSON in this exact shape:
{
  "explanation": "2-3 plain-language sentences on why the risk score is what it is",
  "reasoning_factors": [
    {"factor": "short label", "value": "the number/data point", "contribution": "high|medium|low"}
  ],
  "recommended_action": "one specific, practical, low-cost action matching the dominant risk type",
  "risk_level": "Low|Medium|High"
}

Rules:
- Ground every claim in the numbers you were given — never invent data.
- reasoning_factors must list the 2-4 inputs that most influenced the score; this is what makes the AI explainable rather than a black box.
- Write for a non-expert (municipal officer, farmer, or citizen).
- Keep "explanation" under 80 words.`;

// ─── PROMPT B — AI Climate Copilot ─────────────────────────────────────────
const COPILOT_SYSTEM_PROMPT = `You are the AI Climate Copilot inside ClimateVerse AI. You help users understand climate risk for Pune, Maharashtra, in a friendly, conversational tone. You have access to the current risk scores and recent weather/historical context (provided each turn as JSON). Answer the user's question directly, reference specific numbers when relevant, and if appropriate suggest they check the What-If tool to test an intervention. Keep responses under 100 words unless the user asks for detail. Never invent data outside what you were given.`;

/**
 * Calls Gemini/OpenAI with Prompt A to generate an explainable recommendation.
 * @param {object} riskData - { riskScores, weatherData }
 * @returns {object} { explanation, reasoning_factors, recommended_action, risk_level }
 */
async function getRecommendation(riskData) {
  const userMessage = JSON.stringify(riskData, null, 2);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: RECOMMENDATION_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const text = response.choices[0].message.content;
  return JSON.parse(text);
}

/**
 * Calls OpenAI with Prompt B for a conversational copilot reply.
 * @param {string} userMessage - The user's question
 * @param {object} context     - Current risk scores + weather snapshot
 * @returns {string} AI reply text
 */
async function askCopilot(userMessage, context) {
  const contextBlock = `Current climate context for Pune:\n${JSON.stringify(context, null, 2)}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: COPILOT_SYSTEM_PROMPT },
      { role: 'user', content: `${contextBlock}\n\nUser question: ${userMessage}` },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  return response.choices[0].message.content;
}

module.exports = { getRecommendation, askCopilot };
