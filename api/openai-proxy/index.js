/**
 * Azure Functions HTTP trigger - OpenAI proxy (Node 18+)
 * Place this under: api/openai-proxy/index.js
 * Set OPENAI_API_KEY as an Application Setting in the linked Function App (NOT in the frontend).
 */
import fetch from "node-fetch";

export default async function (context, req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    context.res = { status: 500, body: "Missing OPENAI_API_KEY" };
    return;
  }

  try {
    const { prompt, model = "gpt-4.1-mini" } = req.body || {};
    if (!prompt) {
      context.res = { status: 400, body: "Missing prompt" };
      return;
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: prompt
      })
    });

    const data = await r.json();
    context.res = { status: r.status, body: data };
  } catch (e) {
    context.res = { status: 500, body: String(e) };
  }
}
