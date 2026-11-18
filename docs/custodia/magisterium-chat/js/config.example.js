// ============================================================
// Magisterium AI — API key configuration
// ============================================================
// 1. Copy this file and rename it to: config.js
// 2. Paste your real API key below
// 3. NEVER commit config.js to a public repository
// 4. For a public website you MUST use a backend proxy
//    so the key is never visible in the browser.
// ============================================================

window.MAGISTERIUM_CONFIG = {
  apiKey: "PASTE_YOUR_MAGISTERIUM_API_KEY_HERE",

  // Optional: change the model if Magisterium adds others later
  model: "magisterium-1",

  // Optional system prompt — steers tone for your sites
  systemPrompt:
    "You are a helpful assistant grounded in Catholic teaching, Scripture, and the Magisterium. " +
    "Answer clearly and charitably. When relevant, relate answers to media discernment, " +
    "family viewing, or the moral evaluation of films. Always prefer primary Church sources " +
    "and cite them when possible."
};
