import { useState } from "react";
import { chatWithAI } from "./OpenAI";

export default function ChatWidget() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([
    { role: "assistant", content: "Hi! Ask me anything about Monocrome." },
  ]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || busy) return;
    setInput("");
    setHistory((h) => [...h, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const reply = await chatWithAI(
        msg,
        "You are a helpful AI for a modular housing company named Monocrome. Be concise."
      );
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (e) {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="chat-widget"
      style={{
        maxWidth: 520,
        margin: "2rem auto",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #333",
      }}
    >
      <div style={{ maxHeight: 300, overflowY: "auto", padding: 8 }}>
        {history.map((m, i) => (
          <div
            key={i}
            style={{
              margin: "8px 0",
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background: m.role === "user" ? "#2c2c2c" : "#1a1a1a",
              }}
            >
              <span style={{ color: "#eaeaea", whiteSpace: "pre-wrap" }}>
                {m.content}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={busy ? "Thinking..." : "Type your message"}
          disabled={busy}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #333",
            background: "#111",
            color: "#eee",
          }}
        />
        <button
          onClick={send}
          disabled={busy}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#333",
            color: "#eee",
            border: "1px solid #444",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
