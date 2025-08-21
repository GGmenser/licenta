import fetch from "node-fetch";

export default async function (context, req) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    context.res = { status: 500, body: "Missing OPENWEATHER_API_KEY" };
    return;
  }

  const { city } = req.query; // ex: /api/weather-proxy?city=Cluj-Napoca
  if (!city) {
    context.res = { status: 400, body: "Missing city parameter" };
    return;
  }

  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await r.json();
    context.res = { status: r.status, body: data };
  } catch (e) {
    context.res = { status: 500, body: String(e) };
  }
}
