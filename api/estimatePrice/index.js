import { app } from "@azure/functions";

const API_VERSION = "2024-02-15-preview";

app.http("aiChat", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const {
        messages = [],
        temperature = 0.3,
        top_p = 1,
        // dacă vrei să forțezi ieșire JSON de la model:
        json = false,
        // opțional: adaugi un message de tip "system" aici din backend
        system,
      } = await request.json();

      if (
        !process.env.AZURE_OPENAI_ENDPOINT ||
        !process.env.AZURE_OPENAI_API_KEY ||
        !process.env.AZURE_OPENAI_DEPLOYMENT
      ) {
        return {
          status: 500,
          jsonBody: {
            error:
              "Azure OpenAI nu este configurat. Setează AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT.",
          },
        };
      }

      // Construim payload-ul pentru Azure Chat Completions
      const chatMessages = [];
      if (system) {
        chatMessages.push({ role: "system", content: String(system) });
      }
      // Validăm superficial formatul mesajelor
      for (const m of messages) {
        if (!m || typeof m.role !== "string" || typeof m.content !== "string")
          continue;
        chatMessages.push({ role: m.role, content: m.content });
      }
      if (chatMessages.length === 0) {
        chatMessages.push({ role: "user", content: "Hello" });
      }

      const responseFormat = json
        ? { response_format: { type: "json_object" } }
        : {};

      const url =
        `${process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, "")}` +
        `/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          messages: chatMessages,
          temperature,
          top_p,
          ...responseFormat,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        context.log.error("Azure OpenAI error:", res.status, errText);
        return {
          status: res.status,
          jsonBody: { error: "Azure OpenAI request failed", detail: errText },
        };
      }

      const data = await res.json();
      const choice = data?.choices?.[0]?.message;

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        jsonBody: {
          message: choice || null,
          usage: data?.usage || null,
          model: process.env.AZURE_OPENAI_DEPLOYMENT,
        },
      };
    } catch (e) {
      context.log.error("aiChat fatal:", e?.message || e);
      return { status: 500, jsonBody: { error: "aiChat failed" } };
    }
  },
});
