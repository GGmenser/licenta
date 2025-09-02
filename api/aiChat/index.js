// Node 18+ runtime (ai deja engines >=18 in api/package.json)
const axios = require("axios");

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const userMessage = (body.message || "").toString().trim();
    const systemPrompt = (
      body.systemPrompt || "You are a helpful assistant."
    ).toString();

    if (!userMessage) {
      context.res = {
        status: 400,
        jsonBody: { error: "Missing 'message' in body." },
      };
      return;
    }

    const useAzure = !!(
      process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY
    );

    let replyText = "";

    if (useAzure) {
      // -------- Azure OpenAI --------
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, "");
      // Poți seta modelul/ deployment name din variabila AZURE_OPENAI_DEPLOYMENT
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
      const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

      const { data } = await axios.post(
        url,
        {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.AZURE_OPENAI_API_KEY,
          },
          timeout: 30000,
        }
      );

      replyText = data?.choices?.[0]?.message?.content?.trim() || "";
    } else {
      // -------- OpenAI (non-Azure) --------
      if (!process.env.OPENAI_API_KEY) {
        context.res = {
          status: 500,
          jsonBody: {
            error:
              "No AI credentials configured. Set Azure or OpenAI env vars.",
          },
        };
        return;
      }

      const { data } = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      replyText = data?.choices?.[0]?.message?.content?.trim() || "";
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    };
  } catch (err) {
    context.log.error(
      "aiChat error:",
      err?.response?.data || err?.message || err
    );
    context.res = {
      status: 500,
      jsonBody: {
        error: "AI call failed",
        details: err?.response?.data || err?.message || "Unknown error",
      },
    };
  }
};
