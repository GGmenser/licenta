import fetch from "node-fetch";

export default async function (context, req) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    context.res = { status: 500, body: "Missing OPENCAGE_API_KEY" };
    return;
  }

  const { query } = req.query; // ex: /api/geocode-proxy?query=Cluj-Napoca
  if (!query) {
    context.res = { status: 400, body: "Missing query parameter" };
    return;
  }

  try {
    const r = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}`
    );
    const data = await r.json();
    context.res = { status: r.status, body: data };
  } catch (e) {
    context.res = { status: 500, body: String(e) };
  }
}
