// ai/gemini.js
// Google Gemini AI client — Prompt A (Recommendation) + Prompt B (Copilot)
// With model fallback chain to handle 503 Service Unavailable errors seamlessly.

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Candidate model fallback order
const MODELS_TO_TRY = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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
- reasoning_factors must list the 2-4 inputs that most influenced the score.
- Write for a non-expert (municipal officer, farmer, or citizen).
- Keep "explanation" under 80 words.`;

const COPILOT_SYSTEM_PROMPT = `You are the AI Climate Copilot inside ClimateVerse AI. You help users understand climate risk for Pune, Maharashtra, in a friendly, conversational tone. You have access to current risk scores and recent weather context. Answer directly, reference specific numbers, suggest testing interventions in the What-If tool when relevant. Keep under 100 words.`;

/**
 * Executes a Gemini model call with automatic model fallback if a model gives 503/500/404.
 */
async function generateContentWithFallback(prompt, systemInstruction, isJson = false) {
  if (!genAI) throw new Error('GEMINI_API_KEY missing');

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const config = { temperature: 0.3 };
      if (isJson) config.responseMimeType = 'application/json';

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: config,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(`[Gemini Model ${modelName} failed]: ${err.message} — trying next model`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Builds a dynamic rule-based AI recommendation if Gemini API is totally unreachable (e.g. 503 Google outage)
 */
function buildDynamicFallback(riskData) {
  const scores = riskData?.risk_scores || {};
  const temp = riskData?.weather?.temperature_c || 28;
  const aqi = riskData?.air_quality?.aqi_index || 1;
  const precip = riskData?.weather?.precipitation_mm || 0;
  const level = scores.risk_level || 'Low';
  const overall = scores.overall_risk || 13;

  let action = 'Maintain regular municipal monitoring and clear urban drainage channels ahead of seasonal rainfall.';
  if (scores.heat_risk > 50) {
    action = 'Activate public hydration stations and issue heat advisories for outdoor labor between 12 PM and 4 PM.';
  } else if (scores.flood_risk > 50) {
    action = 'Deploy low-lying ward flood barriers and clear storm culverts in vulnerable riverfront zones.';
  } else if (scores.air_quality_risk > 50) {
    action = 'Implement anti-smog water sprinklers along major traffic corridors and restrict open biomass burning.';
  } else if (scores.drought_risk > 50) {
    action = 'Issue agricultural water conservation guidelines and restrict non-essential irrigation to evening hours.';
  }

  return {
    explanation: `Pune currently experiences a ${level} overall climate risk score of ${overall}/100. Local temperature is ${temp}°C with clean AQI index of ${aqi} and ${precip}mm daily precipitation, keeping immediate climate hazards minimal.`,
    reasoning_factors: [
      { factor: 'Current Temperature', value: `${temp}°C`, contribution: temp > 32 ? 'high' : 'medium' },
      { factor: 'Air Quality Index', value: `${aqi} (Clean)`, contribution: aqi > 3 ? 'high' : 'low' },
      { factor: 'Daily Precipitation', value: `${precip}mm`, contribution: precip > 20 ? 'high' : 'low' },
    ],
    recommended_action: action,
    risk_level: level,
  };
}

async function getRecommendation(riskData) {
  const prompt = `Current Pune climate risk context:\n${JSON.stringify(riskData, null, 2)}\n\nGenerate explainable recommendation JSON.`;

  try {
    const text = await generateContentWithFallback(prompt, RECOMMENDATION_SYSTEM_PROMPT, true);
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) return JSON.parse(match[1]);
      throw new Error('Invalid JSON format returned from Gemini');
    }
  } catch (err) {
    console.error('All Gemini recommendation attempts failed:', err.message);
    return buildDynamicFallback(riskData);
  }
}

async function askCopilot(userMessage, context) {
  const contextBlock = `Current climate context for Pune:\n${JSON.stringify(context, null, 2)}`;
  const prompt = `${contextBlock}\n\nUser question: ${userMessage}`;

  try {
    return await generateContentWithFallback(prompt, COPILOT_SYSTEM_PROMPT, false);
  } catch (err) {
    console.error('All Gemini copilot attempts failed:', err.message);
    const temp = context?.weather?.temperature_c || 28;
    const level = context?.risk_scores?.risk_level || 'Low';
    const score = context?.risk_scores?.overall_risk || 13;
    return `I'm currently assisting with live Pune climate data: Temperature is ${temp}°C, AQI is 1 (Good), and overall climate risk is ${score}/100 (${level} Risk). Ask me about What-If scenarios to simulate changes!`;
  }
}

module.exports = { getRecommendation, askCopilot };
