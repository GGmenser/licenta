import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./BotPrice.css";
import "./Button.css";

/**
 * BotPrice - floating chat widget for EstimatePrice API.
 *
 * Props:
 *  - context: optional object (e.g., { name, lat, lng, weather })
 *  - endpoint: optional string, defaults to "/api/estimatePrice"
 *  - avoidSelector: CSS selector for the element to avoid overlapping (default targets footer)
 */
const BotPrice = ({
  context = null,
  endpoint = "/api/estimatePrice",
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
        "Hi! I’m the Price Bot. Tell me about your modular home idea (rooms, size, finishes, budget, location) and I’ll estimate a price.",
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
        // 18px (spațiu normal) + overlap => ridică panoul exact cât să nu se suprapună
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

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    // după trimitere, resetăm înălțimea textarea-ului
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        autoResize();
      }
    });

    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);

    try {
      const payload = {
        // for the API:
        lat: typeof context?.lat === "number" ? context.lat : null,
        lng: typeof context?.lng === "number" ? context.lng : null,
        area: 80, // optional default
        floors: 1, // optional default
        city: context?.city || null,
        countryCode: context?.countryCode || null,
        countryName: context?.countryName || null,

        // extra info the API can ignore (or you can log):
        prompt: text,
        context: {
          source: "BotPrice",
          location: context?.name || null,
          weather: context?.weather || null,
        },
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/estimatePrice`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = res?.data;
      const answer =
        (typeof data === "string" && data) ||
        data?.answer ||
        data?.message ||
        data?.result ||
        JSON.stringify(data);

      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err) {
      const status = err?.response?.status;
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
              ? "EstimatePrice API not found at /api/estimatePrice. Check that your Azure Function is deployed correctly."
              : `I couldn't reach the EstimatePrice API. ${detail}`,
        },
      ]);
      console.error("BotPrice error:", err);
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
        <div className="botprice-title">Monocrome • Price Bot</div>
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
          placeholder="Describe your unit (rooms, area, finishes)…"
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
