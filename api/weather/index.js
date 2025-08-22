const axios = require("axios");
const http = require("http");
const https = require("https");

const agentHttp = new http.Agent({ keepAlive: true });
const agentHttps = new https.Agent({ keepAlive: true });

const api = axios.create({
  httpAgent: agentHttp,
  httpsAgent: agentHttps,
  timeout: 8000,
});

module.exports = async function (context, req) {
  try {
    const { lat, lng } = req.query || {};
    if (!lat || !lng) {
      context.res = { status: 400, body: { error: "lat & lng required" } };
      return;
    }
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      context.res = {
        status: 500,
        body: { error: "OPENWEATHER_API_KEY missing" },
      };
      return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric`;
    const { data } = await api.get(url);
    context.res = { status: 200, body: data };
  } catch (e) {
    context.log("weather error:", e?.response?.data || e.message);
    context.res = {
      status: 500,
      body: {
        error: "weather failed",
        details: e?.response?.data || e.message,
      },
    };
  }
};
