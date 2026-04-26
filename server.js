const http = require("http");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const { URL } = require("url");

// Load .env file if present (no dotenv dependency needed)
(function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fsSync.existsSync(envPath)) {
    try {
      const lines = fsSync.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx < 1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
        if (key && !(key in process.env)) process.env[key] = val;
      }
      console.log("[env] .env cargado");
    } catch (err) {
      console.warn("[env] Error leyendo .env:", err.message);
    }
  }
})();

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_VERSION = "2023-06-01";
const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
const LEAD_WEBHOOK_SECRET = process.env.LEAD_WEBHOOK_SECRET || "";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function sendJSON(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function safeJoin(base, target) {
  const targetPath = path.normalize(path.join(base, target));
  if (!targetPath.startsWith(path.normalize(base))) return null;
  return targetPath;
}

function extractClaudeText(responseJson) {
  if (!responseJson || !Array.isArray(responseJson.content)) return "";
  return responseJson.content
    .filter(block => block && block.type === "text" && typeof block.text === "string")
    .map(block => block.text)
    .join("")
    .trim();
}

function buildSystemPrompt(leadState = {}) {
  const snapshot = [
  `Servicio actual: ${leadState.service || "no definido"}`,
  `Objetivo: ${leadState.goal || "no definido"}`,
  `Presupuesto: ${leadState.budget || "no definido"}`,
  `Tiempo: ${leadState.timeline || "no definido"}`,
  `Nombre: ${leadState.name || "no definido"}`,
  `Contacto: ${leadState.contact || "no definido"}`,
  ].join("\n");

  return [
    "Eres Gaby, la asistente de voz y ventas de TR0Y STUDIO.",
    "Tu objetivo es responder preguntas y cerrar ventas con estilo hacker, claro, cercano y seguro.",
    "Responde siempre en espanol neutro, con tono femenino, inteligente y directo.",
    "No inventes precios exactos si no tienes el alcance. En su lugar, explica que depende del scope y pide objetivo, plazo y presupuesto.",
    "Si faltan datos, haz una sola pregunta concreta que acerque el cierre.",
    "Siempre intenta orientar a uno de estos servicios:",
    "- Landing pages premium: conversion-first, animaciones, copy y CTA para captar leads o vender servicios y productos.",
    "- Bots de WhatsApp: atencion 24/7, calificacion de leads, respuestas frecuentes, handoff humano y cierre.",
    "- Automatizaciones con IA: n8n, email, CRM, WhatsApp, formularios y seguimiento automatico.",
    "- Branding y presencia digital: identidad, confianza, posicion premium y base de contenido.",
    "- Sistemas de IA personalizados: agentes, copilotos y asistentes de ventas o soporte.",
    "Si preguntan por que incluye cada servicio, explica el entregable, el beneficio y el siguiente paso.",
    "Si el usuario pide precio o cotizacion, ofrece una guia de inversion por alcance y pide solo los datos que faltan para enviar propuesta.",
    "Si detectas una oportunidad de venta, resume el caso, califica al lead y deja el siguiente paso claro.",
    "Cuando detectes interes de compra, termina con un paso siguiente claro hacia WhatsApp o con los tres datos clave: que quiere, para cuando y con que presupuesto.",
    "Mantente breve cuando sea posible, pero agrega detalle util cuando ayude a vender mejor.",
    "",
    "Contexto de lead:",
    snapshot,
  ].join("\n");
}

const LEADS_FILE = path.join(ROOT, "leads.json");

async function saveleadlocally(payload) {
  let leads = [];
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf8");
    leads = JSON.parse(raw);
  } catch (_) {}
  leads.push(payload);
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
  console.log(`[LEAD] #${leads.length} capturado — ${payload.leadState?.name || "anónimo"} | ${payload.leadState?.service || "?servicio"} | ${payload.leadState?.contact || "?contacto"}`);
}

async function forwardLead(payload) {
  await saveleadlocally(payload).catch(err => console.error("[LEAD] Error guardando local:", err));

  if (!LEAD_WEBHOOK_URL) {
    return { forwarded: false, configured: false };
  }

  const headers = { "content-type": "application/json" };
  if (LEAD_WEBHOOK_SECRET) {
    headers.authorization = `Bearer ${LEAD_WEBHOOK_SECRET}`;
  }

  const response = await fetch(LEAD_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text().catch(() => "");
  return {
    forwarded: response.ok,
    status: response.status,
    body: responseText,
  };
}

async function callClaude({ query, history = [], leadState = {} }) {
  if (!ANTHROPIC_API_KEY) {
    const error = new Error("Missing ANTHROPIC_API_KEY");
    error.statusCode = 503;
    throw error;
  }

  const messages = Array.isArray(history)
    ? history
        .filter(entry => entry && typeof entry.content === "string" && entry.content.trim())
        .map(entry => ({
          role: entry.role === "user" ? "user" : "assistant",
          content: entry.content,
        }))
    : [];

  messages.push({ role: "user", content: query });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      temperature: 0.7,
      system: buildSystemPrompt(leadState),
      messages,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      `Anthropic API error ${response.status}: ${data && data.error && data.error.message ? data.error.message : response.statusText}`
    );
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  const text = extractClaudeText(data);
  return text || "No pude generar una respuesta en este momento.";
}

async function serveStatic(req, res, pathname) {
  const cleanedPath = pathname === "/" ? "/index.html" : pathname;
  const targetFile = (cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath).split('?')[0];
  
  // path.join + check para prevenir directory traversal (seguridad)
  const filePath = path.join(ROOT, targetFile);
  
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "403 Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      send(res, 404, "Not found");
      return;
    }
    send(res, 500, "Server error");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/gaby") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== "POST") {
      sendJSON(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString("utf8") || "{}";
      const body = JSON.parse(raw);
      const query = typeof body.query === "string" ? body.query.trim() : "";
      const history = Array.isArray(body.history) ? body.history : [];
      const leadState = body.leadState && typeof body.leadState === "object" ? body.leadState : {};

      if (!query) {
        sendJSON(res, 400, { error: "Missing query" });
        return;
      }

      const reply = await callClaude({ query, history, leadState });
      sendJSON(res, 200, { reply });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      sendJSON(res, statusCode, {
        error: error.message || "Unknown error",
      });
    }
    return;
  }

  if (url.pathname === "/api/leads") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === "GET") {
      try {
        const raw = await fs.readFile(LEADS_FILE, "utf8").catch(() => "[]");
        const leads = JSON.parse(raw);
        const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Leads — TR0Y STUDIO</title>
<style>body{font-family:monospace;background:#0a0a0f;color:#e2e8f0;padding:32px;max-width:900px;margin:0 auto}
h1{color:#7c3aed;margin-bottom:8px}p{color:#64748b;margin-bottom:32px}
.lead{background:#1e1b4b;border:1px solid #312e81;border-radius:12px;padding:20px;margin-bottom:16px}
.lead__name{font-size:1.1rem;font-weight:bold;color:#a5b4fc}
.lead__row{display:flex;gap:16px;flex-wrap:wrap;margin-top:8px}
.tag{background:#312e81;color:#c4b5fd;padding:3px 10px;border-radius:20px;font-size:.8rem}
.lead__time{color:#475569;font-size:.75rem;margin-top:8px}
.empty{color:#475569;text-align:center;padding:64px}</style></head>
<body><h1>Leads capturados</h1><p>${leads.length} lead${leads.length !== 1 ? "s" : ""} · actualiza la página para ver nuevos</p>
${leads.length === 0 ? '<div class="empty">Aún no hay leads. Abre Gaby y simula una consulta de venta.</div>' :
  [...leads].reverse().map(l => {
    const s = l.leadState || {};
    const tags = [s.service, s.goal, s.budget, s.timeline, s.contact].filter(Boolean);
    return `<div class="lead">
      <div class="lead__name">${s.name || "Anónimo"}</div>
      <div class="lead__row">${tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="lead__time">${l.createdAt || ""} · ${l.source || ""}</div>
    </div>`;
  }).join("")}
</body></html>`;
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
      } catch (error) {
        send(res, 500, "Error leyendo leads");
      }
      return;
    }

    if (req.method !== "POST") {
      sendJSON(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString("utf8") || "{}";
      const body = JSON.parse(raw);
      const payload = {
        ...body,
        createdAt: new Date().toISOString(),
      };

      const forwardResult = await forwardLead(payload);
      sendJSON(res, 200, {
        ok: true,
        forwarded: Boolean(forwardResult.forwarded),
        configured: Boolean(LEAD_WEBHOOK_URL),
        status: forwardResult.status || null,
      });
    } catch (error) {
      sendJSON(res, 500, {
        error: error.message || "Unknown error",
      });
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method not allowed");
    return;
  }

  await serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Gaby server running at http://localhost:${PORT}`);
});
