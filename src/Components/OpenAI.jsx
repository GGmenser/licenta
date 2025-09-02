export async function chatWithAI(
  message,
  systemPrompt = "You are a helpful assistant."
) {
  const res = await fetch("/api/aiChat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, systemPrompt }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.reply || "";
}
