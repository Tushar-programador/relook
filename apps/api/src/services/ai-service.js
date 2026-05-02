import OpenAI from "openai";
import { FeedbackModel } from "../models/feedback-model.js";
import { ProjectModel } from "../models/project-model.js";
import { ApiError } from "../utils/api-error.js";
import { env } from "../config/env.js";

function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new ApiError(503, "AI features are not configured. Set OPENAI_API_KEY in your environment.");
  }
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

async function getApprovedFeedbackForProject(userId, projectId) {
  const project = await ProjectModel.findOne({ _id: projectId, userId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const items = await FeedbackModel.find({ projectId: project._id, status: "approved" })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return { project, items };
}

function buildFeedbackText(items) {
  return items
    .map((item, i) => {
      const name = item.name || "Anonymous";
      const msg = item.message?.trim() || `[${item.type} testimonial — no text transcript]`;
      return `${i + 1}. ${name}: "${msg}"`;
    })
    .join("\n");
}

/**
 * Summarize all approved feedback for a project in 2–3 paragraphs.
 */
export async function summarizeFeedback(userId, projectId) {
  const { project, items } = await getApprovedFeedbackForProject(userId, projectId);
  if (!items.length) {
    throw new ApiError(400, "No approved feedback available to summarize");
  }

  const openai = getOpenAI();
  const feedbackText = buildFeedbackText(items);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a customer insight analyst. Summarize the customer feedback concisely in 2–3 paragraphs, highlighting common themes, overall sentiment, and the most important takeaways for the business."
      },
      {
        role: "user",
        content: `Summarize the following approved customer feedback for "${project.name}":\n\n${feedbackText}`
      }
    ],
    max_tokens: 500
  });

  return {
    projectId,
    projectName: project.name,
    feedbackCount: items.length,
    summary: completion.choices[0].message.content
  };
}

/**
 * Extract the 3–5 best/most impactful testimonials for use in marketing.
 */
export async function extractHighlights(userId, projectId) {
  const { project, items } = await getApprovedFeedbackForProject(userId, projectId);
  if (!items.length) {
    throw new ApiError(400, "No approved feedback available to extract highlights from");
  }

  const openai = getOpenAI();
  const feedbackText = buildFeedbackText(items);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          'You are a marketing specialist. Select the 3–5 most impactful testimonials and explain briefly why each one stands out. Respond with only valid JSON: {"highlights":[{"index":1,"name":"...","quote":"...","reason":"..."}]}'
      },
      {
        role: "user",
        content: `Pick the best testimonials from this feedback list for "${project.name}":\n\n${feedbackText}`
      }
    ],
    max_tokens: 700,
    response_format: { type: "json_object" }
  });

  let highlights = [];
  try {
    const parsed = JSON.parse(completion.choices[0].message.content);
    highlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];
  } catch {
    highlights = [];
  }

  return {
    projectId,
    projectName: project.name,
    feedbackCount: items.length,
    highlights
  };
}

/**
 * Analyze the overall sentiment across all approved feedback.
 */
export async function analyzeSentiment(userId, projectId) {
  const { project, items } = await getApprovedFeedbackForProject(userId, projectId);
  if (!items.length) {
    throw new ApiError(400, "No approved feedback available to analyze");
  }

  const openai = getOpenAI();
  const feedbackText = buildFeedbackText(items);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          'You are a sentiment analysis expert. Analyze the sentiment of the provided feedback. Respond with only valid JSON: {"overall":"positive|neutral|negative","score":85,"breakdown":{"positive":0,"neutral":0,"negative":0},"themes":["..."]}'
      },
      {
        role: "user",
        content: `Analyze sentiment for "${project.name}" customer feedback:\n\n${feedbackText}`
      }
    ],
    max_tokens: 400,
    response_format: { type: "json_object" }
  });

  let result = { overall: "unknown", score: 0, breakdown: {}, themes: [] };
  try {
    result = JSON.parse(completion.choices[0].message.content);
  } catch {
    // leave default
  }

  return {
    projectId,
    projectName: project.name,
    feedbackCount: items.length,
    ...result
  };
}
