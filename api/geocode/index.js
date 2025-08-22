const axios = require("axios");

module.exports = async function (context, req) {
  try {
    const { lat, lng } = req.query || {};
    if (!lat || !lng) {
      context.res = { status: 400, body: { error: "lat & lng required" } };
      return;
    }
    const key = process.env.OPENCAGE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${key}`;
    const { data } = await axios.get(url);
    context.res = { status: 200, body: data };
  } catch (e) { context.log(e); context.res = { status: 500, body: { error: "geocode failed" } }; }
};
