import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./BotPrice.css";
import "./Button.css";

const BotPrice = ({
  context = null,
  // singura schimbare de prop: endpoint-ul implicit e acum aiChat
  endpoint = "/api/aiChat",
  avoidSelector = "footer, #footer, .site-footer",
}) => {
  // panelul e permanent deschis
  const open = true;

  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m your intelligent price calculator. Tell me more about your modular home idea and I’ll estimate a price.",
    },
  ]);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // === Anti-overlap cu footer ===
  const [bottomOffset, setBottomOffset] = useState(30); // px, spațiul față de marginea de jos

  // calculează cât „se urcă” panoul când footerul intră în viewport
  useEffect(() => {
    const recalc = () => {
      const el =
        (avoidSelector && document.querySelector(avoidSelector)) || null;

      if (!el) {
        // nu avem footer -> stăm la offsetul implicit
        setBottomOffset(30);
        return;
      }

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // dacă partea de sus a footerului intră în viewport, calculăm suprapunerea
      if (rect.top < vh) {
        const overlap = vh - rect.top; // cât intră footerul „peste” partea de jos a ecranului
        setBottomOffset(30 + Math.max(0, overlap));
      } else {
        setBottomOffset(30);
      }
    };

    // recalc inițial + pe scroll/resize
    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [avoidSelector]);

  // context summary for system messages
  const initialContext = useMemo(() => {
    if (!context) return null;
    const { name, lat, lng, weather } = context;
    const parts = [];
    if (name) parts.push(`Location: ${name}`);
    if (typeof lat === "number" && typeof lng === "number")
      parts.push(`Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    if (weather) parts.push(`Weather: ${weather}`);
    return parts.length ? parts.join(" | ") : null;
  }, [context]);

  // adaugă context la deschidere
  useEffect(() => {
    if (open && initialContext) {
      setMessages((prev) => {
        const already = prev.some(
          (m) => m.role === "system" && m.content.includes("Context:")
        );
        if (already) return prev;
        return [
          { role: "system", content: `Context: ${initialContext}` },
          ...prev,
        ];
      });
    }
  }, [open, initialContext]);

  // auto-scroll la mesaje noi
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, open]);

  // auto-resize pentru textarea (până la 33vh; după aceea apare scroll)
  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto"; // reset pentru măsurare corectă
    const maxH = Math.floor(window.innerHeight / 3); // ~33vh
    const newH = Math.min(ta.scrollHeight, maxH);
    ta.style.height = newH + "px";
    // scrollbar apare automat când scrollHeight > maxH (overflow-y: auto în CSS)
  };

  // setăm înălțimea inițială + refacem la resize
  useEffect(() => {
    autoResize();
    const onResize = () => autoResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // === helper strict local; NU afectează afișarea ===
  const fmtEUR = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? "");
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${Math.round(n)} EUR`;
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const systemMsg =
      "You are Monocrome's helpful assistant. Be concise and practical.";
    const convo = [
      ...(messages || []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    setInput("");
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        autoResize();
      }
    });

    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);

    try {
      // Încercare #1: schema "messages"
      const primary = await axios.post(
        endpoint,
        { system: systemMsg, messages: convo, temperature: 0.3, json: false },
        { headers: { "Content-Type": "application/json" } }
      );
      const d1 = primary?.data || {};
      const reply1 =
        d1?.message?.content ||
        d1?.reply ||
        d1?.content ||
        d1?.answer ||
        JSON.stringify(d1);
      setMessages((m) => [...m, { role: "assistant", content: reply1 }]);
    } catch (err) {
      const status = err?.response?.status;

      if (status === 400 || status === 422) {
        // Încercare #2: schema simplă "message"
        try {
          const fb = await axios.post(
            endpoint,
            { message: text },
            { headers: { "Content-Type": "application/json" } }
          );
          const d2 = fb?.data || {};
          const reply2 =
            d2?.message?.content ||
            d2?.reply ||
            d2?.content ||
            d2?.answer ||
            JSON.stringify(d2);
          setMessages((m) => [...m, { role: "assistant", content: reply2 }]);
        } catch (e2) {
          const detail2 =
            e2?.response?.data?.error ||
            e2?.message ||
            "Unknown error. Check console.";
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: `I couldn't reach the aiChat API. ${detail2}`,
            },
          ]);
          console.error(
            "BotPrice aiChat fallback error:",
            e2?.response?.data || e2
          );
        }
      } else {
        const detail =
          err?.response?.data?.error ||
          err?.message ||
          "Unknown error. Check console.";
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              status === 404
                ? "aiChat API not found at /api/aiChat. Check that your Azure Function is deployed correctly."
                : `I couldn't reach the aiChat API. ${detail}`,
          },
        ]);
        console.error("BotPrice aiChat error:", err?.response?.data || err);
      }
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="botprice-panel"
      role="dialog"
      aria-label="Price assistant"
      style={{ bottom: bottomOffset }} // <- aici aplicăm offsetul dinamic
    >
      <div className="botprice-header">
        <div className="botprice-title">Monocrome • Assistant</div>
      </div>

      {/* Mesajele sus */}
      <div className="botprice-messages" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`botprice-msg ${
              m.role === "user"
                ? "botprice-user"
                : m.role === "system"
                ? "botprice-system"
                : "botprice-assistant"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <div className="botprice-typing">Calculating…</div>}
      </div>

      {/* Inputul jos, pe coloană: textarea deasupra, butonul dedesubt */}
      <div className="botprice-input botprice-input-column">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Tell me about your modular home idea..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize();
          }}
          onKeyDown={onKey}
        />
        <button
          className="botprice-send botprice-send-block"
          onClick={send}
          disabled={busy || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BotPrice;
