/**
 * Local proxy for Magisterium AI Chat Completions API.
 * Keeps your API key off the frontend and avoids CORS errors.
 *
 * Usage:
 *   1. Set your key:  export MAGISTERIUM_API_KEY="your-key-here"
 *      OR put it in the KEY variable below for local testing only.
 *   2. node server.js
 *   3. Open the chat page — it will call http://127.0.0.1:3001/chat
 */

const http = require("http");
const https = require("https");

// Prefer environment variable. Fallback only for local testing.
const KEY =
  process.env.MAGISTERIUM_API_KEY ||
  "PASTE_YOUR_MAGISTERIUM_API_KEY_HERE";

const PORT = 3001;
const MAGISTERIUM_HOST = "www.magisterium.com";
const MAGISTERIUM_PATH = "/api/v1/chat/completions";

const server = http.createServer((req, res) => {
  // CORS — allow local dev origins
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, keyConfigured: !KEY.includes("PASTE_YOUR") }));
    return;
  }

  if (req.method !== "POST" || req.url !== "/chat") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. POST to /chat" }));
    return;
  }

  if (!KEY || KEY.includes("PASTE_YOUR")) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error:
          "API key not set. Set MAGISTERIUM_API_KEY env var or edit KEY in server.js",
      })
    );
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1e6) req.destroy(); // 1MB limit
  });

  req.on("end", () => {
    let parsed;
    try {
      parsed = JSON.parse(body || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    const payload = JSON.stringify({
      model: parsed.model || "magisterium-1",
      messages: parsed.messages || [],
      stream: false,
    });

    const options = {
      hostname: MAGISTERIUM_HOST,
      path: MAGISTERIUM_PATH,
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = "";
      proxyRes.on("data", (chunk) => (data += chunk));
      proxyRes.on("end", () => {
        res.writeHead(proxyRes.statusCode || 502, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        });
        res.end(data);
      });
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy failed: " + err.message }));
    });

    proxyReq.write(payload);
    proxyReq.end();
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("");
  console.log("  Magisterium proxy running");
  console.log("  → http://127.0.0.1:" + PORT + "/chat");
  console.log("  → Health: http://127.0.0.1:" + PORT + "/health");
  if (KEY.includes("PASTE_YOUR")) {
    console.log("");
    console.log("  ⚠  No API key set yet.");
    console.log('     export MAGISTERIUM_API_KEY="your-key"');
    console.log("     then restart this server.");
  } else {
    console.log("  ✓ API key loaded");
  }
  console.log("");
});
