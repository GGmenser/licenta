const axios = require("axios");

// Haversine pentru distanță km
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Aproximare simplă a climei după latitudine
function climateBand(lat) {
  const A = Math.abs(lat);
  if (A >= 55) return "cold";
  if (A >= 35) return "temperate";
  return "warm";
}

// Fallback mic pentru „avantaje” dacă nu avem AI
function genericAdvantages(countryCode, climate) {
  const lines = [
    "Rapid assembly and predictable timelines.",
    "Factory-controlled quality and reduced on-site waste.",
    "Scalable layout options; easy future expansion.",
  ];
  if (climate === "cold")
    lines.push(
      "Good thermal performance with upgraded insulation options for cold climates."
    );
  if (["RO", "IT", "GR", "TR"].includes(countryCode))
    lines.push(
      "Seismic-conscious designs available (lightweight modules, engineered connections)."
    );
  return lines;
}

async function aiAdvantages({
  endpoint,
  key,
  deployment,
  countryName,
  countryCode,
  climate,
  city,
}) {
  if (!endpoint || !key || !deployment) return null;

  const url = `${endpoint.replace(
    /\/+$/,
    ""
  )}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
  const system = `You are a precise sales assistant for a modular housing company named Monocrome.
Write in concise, bulleted English suitable for a pricing sidebar.
Avoid overpromising or legal/regulatory claims. Keep to 4–6 bullets.`;

  const user = `Location context:
- Country: ${countryName || countryCode || "Unknown"}
- City/area: ${city || "Unknown"}
- Climate band: ${climate} (rough bands: cold ≥55° lat, temperate 35–55°, warm <35°)
- Constraints: Do NOT claim permits or tax specifics; avoid prices (the backend calculates price). Focus on practical location-specific benefits: logistics, climate fit, access, materials durability.

Now produce bullet points ("Advantages of building a modular home here").`;

  const { data } = await axios.post(
    url,
    {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    },
    {
      headers: { "api-key": key, "Content-Type": "application/json" },
      timeout: 20000,
    }
  );
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

module.exports = async function (context, req) {
  try {
    const {
      lat,
      lng,
      area = 80,
      floors = 1,
      city,
      countryCode,
      countryName,
    } = req.body || {};
    if (typeof lat !== "number" || typeof lng !== "number") {
      context.res = {
        status: 400,
        jsonBody: { error: "lat/lng required (numbers)" },
      };
      return;
    }

    // -------------- Parametri baza (ajustează liber) --------------
    // Fabrica "Monocrome" (exemplu) – Pitesti, RO (ajustează la locația ta reală)
    const FACTORY = { lat: 44.856, lng: 24.869 };

    // Costuri baza (EUR)
    const BASE_PRICE_SQM_RO = 650; // finisaj standard, structural steel/CLT, ajustabil
    const INSTALLATION_FEE = 3500; // macara, montaj
    const TRANSPORT_EUR_PER_KM = 2.2; // camioane + escortă unde e cazul

    // Indici manoperă (relative la RO=1.0). Ajustează după piața ta:
    const LABOR_IDX = {
      RO: 1.0,
      BG: 0.9,
      HU: 1.1,
      PL: 1.05,
      GR: 1.25,
      IT: 1.6,
      DE: 1.8,
      FR: 1.7,
      ES: 1.4,
      UK: 1.9,
      AT: 1.75,
    };

    // TVA (informativ, inclus în estimare finală). Poți scoate TVA din estimare dacă preferi.
    const VAT = {
      RO: 0.19,
      BG: 0.2,
      HU: 0.27,
      IT: 0.22,
      DE: 0.19,
      FR: 0.2,
      ES: 0.21,
      UK: 0.2,
      PL: 0.23,
      GR: 0.24,
      AT: 0.2,
    };

    // Multiplicatori climatici (materiale/izolație)
    const clim = climateBand(lat);
    const CLIMATE_MUL = { cold: 1.15, temperate: 1.0, warm: 1.05 }[clim] || 1.0;

    // Multiplicator seismic (aprox., pentru țări cu risc înalt)
    const seismicCountries = ["RO", "IT", "GR", "TR"];
    const SEISMIC_MUL = seismicCountries.includes(countryCode || "")
      ? 1.05
      : 1.0;

    // Etaje (logistică + structură)
    const FLOORS_MUL =
      Math.max(1, Math.min(3, floors)) === 1 ? 1.0 : floors === 2 ? 1.08 : 1.15;

    // -------------- Calcul --------------
    const distanceKm = haversineKm(FACTORY, { lat, lng });
    const longHaulMul = distanceKm > 800 ? 1.05 : 1.0;

    const laborIdx = LABOR_IDX[countryCode || "RO"] || 1.25; // fallback
    const vat = VAT[countryCode || "RO"] ?? 0.2;

    const base = BASE_PRICE_SQM_RO * area;
    const materialsAndLabor =
      base * laborIdx * CLIMATE_MUL * SEISMIC_MUL * FLOORS_MUL;
    const transport = distanceKm * TRANSPORT_EUR_PER_KM;
    const subtotal =
      materialsAndLabor * longHaulMul + INSTALLATION_FEE + transport;

    const totalWithVAT = subtotal * (1 + vat);

    // -------------- AI pentru avantaje --------------
    let advantagesText = null;
    try {
      advantagesText = await aiAdvantages({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        key: process.env.AZURE_OPENAI_API_KEY,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini",
        countryName,
        countryCode,
        climate: clim,
        city,
      });
    } catch (e) {
      context.log.warn("AI advantages failed, falling back:", e?.message || e);
    }

    if (!advantagesText) {
      const bullets = genericAdvantages(countryCode || "RO", clim);
      advantagesText = bullets.map((b) => `• ${b}`).join("\n");
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: {
          lat,
          lng,
          area,
          floors,
          city,
          countryCode,
          countryName,
          climate: clim,
          distanceKm: Math.round(distanceKm),
        },
        breakdown: {
          base_price_sqm_ro: BASE_PRICE_SQM_RO,
          labor_index: laborIdx,
          climate_multiplier: CLIMATE_MUL,
          seismic_multiplier: SEISMIC_MUL,
          floors_multiplier: FLOORS_MUL,
          long_haul_multiplier: longHaulMul,
          transport_eur_per_km: TRANSPORT_EUR_PER_KM,
          installation_fee: INSTALLATION_FEE,
          vat_rate: vat,
        },
        estimate: {
          currency: "EUR",
          materials_and_labor: Math.round(materialsAndLabor),
          transport: Math.round(transport),
          subtotal: Math.round(subtotal),
          total_with_vat: Math.round(totalWithVAT),
        },
        advantages_markdown: advantagesText,
      }),
    };
  } catch (err) {
    context.log.error(
      "estimatePrice error:",
      err?.response?.data || err?.message || err
    );
    context.res = { status: 500, jsonBody: { error: "estimation failed" } };
  }
};
