const axios = require("axios");

module.exports = async function (context) {
  try {
    await Promise.allSettled([
      axios.get(
        process.env.WARMUP_GEO ||
          "http://localhost:7071/api/geocode?lat=44.43&lng=26.10"
      ),
      axios.get(
        process.env.WARMUP_WEA ||
          "http://localhost:7071/api/weather?lat=44.43&lng=26.10"
      ),
    ]);
    context.log("Warmup ping ok");
  } catch (e) {
    context.log("Warmup error:", e.message);
  }
};
