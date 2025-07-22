import { Configuration, OpenAIApi } from "openai";

const configuration  = new Configuration({
  apiKey: import.meta.env.VITE_OPENCAGE_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const chatWithGPT35 = async (message) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: message },
    ],
  });
  return response.data.choices[0].message.content;
};