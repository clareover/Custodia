// ============================================================
// Magisterium chat configuration
// ============================================================
// With the local proxy, the API key lives in the proxy (server.js),
// NOT in the browser. Leave apiKey empty when using the proxy.
// ============================================================

window.MAGISTERIUM_CONFIG = {
  // Use the local proxy (recommended — avoids CORS and hides the key)
  // Start it with:  node proxy/server.js
  proxyUrl: "http://127.0.0.1:3001/chat",

  // Only used if proxyUrl is empty/null (direct browser call — usually blocked by CORS)
  apiKey: "",

  model: "magisterium-1",

  systemPrompt:
    "You are a helpful assistant grounded in Catholic teaching, Scripture, and the Magisterium. " +
    "Answer clearly and charitably. When relevant, relate answers to media discernment, " +
    "family viewing, or the moral evaluation of films. Always prefer primary Church sources " +
    "and cite them when possible."
};
