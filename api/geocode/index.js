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
    const key = process.env.OPENCAGE_API_KEY;
    if (!key) {
      context.res = {
        status: 500,
        body: { error: "OPENCAGE_API_KEY missing" },
      };
      return;
    }
    const url =
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${key}` +
      `&limit=1&no_annotations=1&abbrv=1&pretty=0&language=en`;
    const { data } = await api.get(encodeURI(url));
    context.res = { status: 200, body: data };
  } catch (e) {
    context.log("geocode error:", e?.response?.data || e.message);
    context.res = {
      status: 500,
      body: {
        error: "geocode failed",
        details: e?.response?.data || e.message,
      },
    };
  }
};
