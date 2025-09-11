const PRICE_EUR_PER_M2 = 2000;

const SYSTEM_PROMPT = `
You are Monochrome Assistant, representing Monochrome (Romania), a company that builds modular/prefab houses in Romania.

PRIMARY SCOPE: modular homes and tightly related topics (architecture/layout, structural systems such as CLT/steel/timber frames, materials & finishes, insulation and vapor control, energy efficiency, HVAC/heat pumps, PV, windows/doors, foundations, transport & crane, installation, timelines, site prep, permits/compliance, pricing/estimation, lifecycle maintenance, warranties).

BRAND AWARENESS: when the user mentions "Monochrome", "monochrome" or "monocrome", refer to the Romanian company Monochrome that builds modular houses (this app is for them).

PRICING RULE: when asked about price/cost/quotation/offers for a house, use a base rate of 2000 EUR per square meter. If the floor area is not provided, ask ONE short clarifying question to get it. If an area is provided, multiply area × 2000 EUR/m² and return a concise estimate. You may note that exact price depends on specs (finishes, MEP/HVAC, site works, foundation, permits, transport & crane, VAT), but keep it short.

AMBIGUITY RULE: if the request is ambiguous but probably about modular housing, ask exactly ONE short clarifying question before answering.

OFF-TOPIC RULE: if clearly off-topic, briefly decline and redirect back to modular-home topics.

STYLE: friendly, concise, practical. Reply in the user's language (Romanian if the user is in Romanian).

At the END of every answer, append a fenced JSON metadata block on a new line:
\`\`\`json
{"domain": "modular" | "ambiguous" | "other"}
\`\`\`
`;

// ───── Greetings detection ────────────────────────────────────────────────────
const GREETING_KEYWORDS = [
  "buna",
  "bună",
  "salut",
  "hello",
  "hi",
  "hei",
  "hey",
];
function isGreeting(text) {
  const t = (text || "").toLowerCase().trim();
  return GREETING_KEYWORDS.some((k) => t.startsWith(k));
}

// ───── Price intent & area parsing ────────────────────────────────────────────
const PRICE_KEYWORDS = [
  "pret",
  "preț",
  "cost",
  "costa",
  "costă",
  "oferta",
  "ofertă",
  "estimare",
  "estimate",
  "price",
  "quotation",
  "preventiv",
  "deviz",
];
function hasPriceIntent(text) {
  const t = (text || "").toLowerCase();
  return PRICE_KEYWORDS.some((k) => t.includes(k));
}
// „80 mp”, „80 m2”, „80 m²”, „80 metri pătrați”
function extractAreaM2(text) {
  if (!text) return null;
  const t = text.toLowerCase().replace(",", ".");
  const re = /(\d+(\.\d+)?)\s*(m2|mp|m²|metri\s*pătrați|metri\s*patrati)/i;
  const m = re.exec(t);
  if (!m) return null;
  const val = parseFloat(m[1]);
  return Number.isFinite(val) ? val : null;
}
function formatEUR(v) {
  try {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${Math.round(v)} EUR`;
  }
}

// ───── JSON metadata extractor (de la finalul răspunsului modelului) ─────────
function extractDomainTag(text) {
  if (!text) return { domain: "modular", clean: text };
  const fenceStart = text.lastIndexOf("```json");
  const fenceEnd = text.lastIndexOf("```");
  if (fenceStart !== -1 && fenceEnd !== -1 && fenceEnd > fenceStart) {
    const jsonRaw = text.slice(fenceStart + 7, fenceEnd).trim();
    try {
      const meta = JSON.parse(jsonRaw);
      const clean = text.slice(0, fenceStart).trim();
      return { domain: meta?.domain || "modular", clean };
    } catch {
      return { domain: "modular", clean: text };
    }
  }
  return { domain: "modular", clean: text };
}

// ───── Helper: compune un greeting cald, consistent cu domeniul ──────────────
function greetingReply() {
  // includ blocul JSON la final pentru consistență
  const body =
    "Salut! 👋 Sunt asistentul Monochrome. Te pot ajuta cu întrebări despre case modulare.\n" +
    "Cu ce vrei să începem?";
  return {
    role: "assistant",
    content: body,
    domain: "modular",
  };
}

/**
 * Apel către backend-ul tău /api/aiChat care acceptă { message, systemPrompt, temperature }.
 * - Dacă backend-ul ignoră systemPrompt, avem fallback pe client pentru preț.
 * - Funcționează și cu prompturile automate trimise din BotPrice când se schimbă contextul
 *   (ex: „avantajele construirii în {loc}, vreme: …”).
 * @param {string} userText
 * @returns {Promise<{role:'assistant', content:string, refusal?:true}>}
 */
export default async function aiChat(userText) {
  const text = String(userText ?? "").trim();
  if (!text) {
    return {
      role: "assistant",
      refusal: true,
      content:
        "Spune-mi ce te interesează despre case modulare Monochrome: suprafață, buget, materiale/izolație, energie, montaj sau autorizații.",
    };
  }

  // 1) Răspuns instant la saluturi (fără a mai chema backend-ul)
  if (isGreeting(text)) {
    return greetingReply();
  }

  // 2) Apel normal la backend cu prompt brand-aware + regulă de preț în sistem
  let data;
  try {
    const resp = await fetch("/api/aiChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.3, // prietenos, dar nu divagant
      }),
    });

    if (!resp.ok) {
      // backend down → fallback prietenos
      return {
        role: "assistant",
        refusal: true,
        content:
          "Momentan nu pot genera răspunsul. Pot însă estima rapid: spune-mi suprafața (m²) și calculez la 2000 €/m² pentru Monochrome.",
      };
    }
    data = await resp.json();
  } catch {
    return {
      role: "assistant",
      refusal: true,
      content:
        "Momentan nu pot prelua întrebarea. Dacă îmi spui suprafața (m²), îți dau o estimare rapidă la 2000 €/m² pentru Monochrome.",
    };
  }

  // 3) Extrage conținutul din răspuns
  const full =
    (typeof data === "string" && data) ||
    data?.content ||
    data?.message?.content ||
    data?.reply ||
    data?.answer ||
    "";

  if (!full) {
    return {
      role: "assistant",
      refusal: true,
      content:
        "Nu am găsit un răspuns. Dacă îmi spui suprafața (m²), pot estima rapid la 2000 €/m² pentru Monochrome.",
    };
  }

  // 4) Parsăm metadatele de domeniu
  let { domain, clean } = extractDomainTag(full);

  if (domain === "other") {
    // clar off-topic → redirecționare scurtă
    return {
      role: "assistant",
      refusal: true,
      content:
        "Nu îți pot răspunde la întrebare. Te pot ajuta doar cu întrebări legate de casele modulare Monochrome.",
    };
  }

  // 5) Fallback/augmentare client pentru PREȚ (în caz că modelul n-a aplicat regula)
  if (hasPriceIntent(text)) {
    const area = extractAreaM2(text);
    if (area && area > 0) {
      const estimate = area * PRICE_EUR_PER_M2;
      const line =
        `\n\nEstimare Monochrome: ${area} m² × ${PRICE_EUR_PER_M2.toLocaleString(
          "ro-RO"
        )} €/m² ≈ ${formatEUR(estimate)}.\n` +
        `Notă: prețul final depinde de specificații (finisaje, MEP/HVAC), fundație, autorizații, transport & macara și regimul TVA.`;
      clean = clean ? `${clean}${line}` : line.trim();
    } else {
      // fără suprafață → o singură clarificare prietenoasă
      const q =
        "\n\nPentru o estimare la Monochrome folosim 2000 €/m². Ce suprafață (m²) ai în minte?";
      if (!/suprafață|suprafata|m²|mp/i.test(clean || "")) {
        clean = clean ? `${clean}${q}` : q.trim();
      }
    }
  }

  if (domain === "ambiguous") {
    // modelul ar trebui deja să fi pus o întrebare de clarificare
    return { role: "assistant", content: clean };
  }

  // domain === "modular" → răspuns normal
  return { role: "assistant", content: clean };
}
