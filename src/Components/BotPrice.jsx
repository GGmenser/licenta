import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BotPrice.css";
import "./Button.css";
import aiChat from "../services/aiChat";

const BotPrice = ({
  context = null,
  avoidSelector = "footer, #footer, .site-footer",
}) => {
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

  const [bottomOffset, setBottomOffset] = useState(30);

  useEffect(() => {
    const recalc = () => {
      const el =
        (avoidSelector && document.querySelector(avoidSelector)) || null;

      if (!el) {
        setBottomOffset(30);
        return;
      }

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.top < vh) {
        const overlap = vh - rect.top;
        setBottomOffset(30 + Math.max(0, overlap));
      } else {
        setBottomOffset(30);
      }
    };

    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [avoidSelector]);

  const initialContext = useMemo(() => {
    if (!context) return null;
    const { name, lat, lng, weather } = context;
    const parts = [];
    if (name) parts.push(`Location: ${name}`);
    if (typeof lat === "number" && typeof lng === "number")
      parts.push(`Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    if (weather)
      parts.push(`Weather: ${typeof weather === "string" ? weather : ""}`);
    return parts.length ? parts.join(" | ") : null;
  }, [context]);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, open]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxH = Math.floor(window.innerHeight / 3);
    const newH = Math.min(ta.scrollHeight, maxH);
    ta.style.height = newH + "px";
  };

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
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        autoResize();
      }
    });

    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);

    try {
      const res = await aiChat(text);

      if (res.refusal) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: res.content, refusal: true },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: res.content }]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the aiChat service. Please try again later.",
        },
      ]);
      console.error("BotPrice aiChat error:", err);
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

  // ────────────────────────────────────────────────────────────────────────────
  // AUTO-PROMPT la schimbarea contextului (LOC + VREME)
  const lastAutoKeyRef = useRef(null);

  function buildAutoPrompt(ctx) {
    if (!ctx) return "";
    const { name, lat, lng, weather } = ctx;

    const loc = name
      ? name
      : [
          typeof lat === "number" ? lat.toFixed(3) : "",
          typeof lng === "number" ? lng.toFixed(3) : "",
        ]
          .filter(Boolean)
          .join(", ");

    // weather poate fi string în forma "descriere, 22°C"
    const w =
      typeof weather === "string" && weather.trim()
        ? `Vreme: ${weather}`
        : "Fără date meteo.";

    return `Prezintă pe scurt (4–6 bullet points) avantajele construirii unei case modulare Monochrome în zona ${loc}.
${w}.
Include aspecte despre: adaptarea la climă, eficiență energetică/izolații, timp de execuție/montaj, logistică (transport & macara), autorizații (general), mentenanță.`;
  }

  useEffect(() => {
    if (!context) return;

    // cheie stabilă pentru a evita trimiterea dublă pe același context
    const k = JSON.stringify({
      name: context.name || "",
      lat:
        typeof context.lat === "number"
          ? Number(context.lat.toFixed?.(3) ?? context.lat)
          : null,
      lng:
        typeof context.lng === "number"
          ? Number(context.lng.toFixed?.(3) ?? context.lng)
          : null,
      w: typeof context.weather === "string" ? context.weather : "",
    });

    if (lastAutoKeyRef.current === k) return;
    lastAutoKeyRef.current = k;

    // pornește indicatorul de "typing"
    setBusy(true);

    (async () => {
      try {
        const prompt = buildAutoPrompt(context);
        if (!prompt) return;

        const res = await aiChat(prompt);

        // adăugăm DOAR mesajul asistentului (nu simulăm input de la user)
        if (res?.content) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.content },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Am preluat locația. Vrei și o estimare de cost (2000 €/m²)?",
            },
          ]);
        }
      } catch (e) {
        console.error("Auto-advise error:", e);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Am preluat locația, dar nu am putut genera recomandările. Îți pot estima costul sau pot discuta materiale/izolații dacă vrei.",
          },
        ]);
      } finally {
        setBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="botprice-panel"
      role="dialog"
      aria-label="Price assistant"
      style={{ bottom: bottomOffset }}
    >
      <div className="botprice-header">
        <div className="botprice-title">Monocrome • Assistant</div>
      </div>

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
        {busy && <div className="botprice-typing">Thinking...</div>}
      </div>

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
