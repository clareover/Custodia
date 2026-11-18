# Magisterium AI Chatbox

Custom chat UI for the Catholic Movie Guide and Custodia filter app.

## Why a proxy?

Browsers block direct calls to https://www.magisterium.com/api/... (CORS).
A small local proxy fixes that and keeps your API key off the webpage.

---

## Quick start (3 steps)

### 1. Put your API key in the proxy

Open a terminal in the magisterium-chat folder and run:

```bash
export MAGISTERIUM_API_KEY="your-real-key-here"
cd proxy
node server.js
```

You should see:

```
Magisterium proxy running
→ http://127.0.0.1:3001/chat
✓ API key loaded
```

Leave that terminal open.

### 2. Open the chat page

Serve the site as you already do (port 3000 is fine) and open:

- Standalone: magisterium-chat/index.html
- Or the Movie Guide / Custodia pages (floating button)

The chat is already configured to call http://127.0.0.1:3001/chat.

### 3. Ask a question

Try: "What does the Catechism say about prudence?"

---

## Files

| Path | Purpose |
|------|---------|
| index.html | Standalone chat page |
| proxy/server.js | Local proxy (holds the API key) |
| js/config.js | Points the UI at the proxy |
| js/chat.js | Chat UI logic |
| css/chat.css | Styles |

## Security

- API key lives only in the proxy process / environment variable.
- Never put the real key in js/config.js for a public site.
- For production later: deploy the same proxy idea as a Netlify Function, Cloudflare Worker, or small backend.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Cannot reach proxy | Run node proxy/server.js and leave it running |
| Proxy says key not set | export MAGISTERIUM_API_KEY="..." then restart proxy |
| CORS errors to magisterium.com | Still calling API directly — check config.js has proxyUrl set |
| Port 3001 in use | Edit PORT at the top of proxy/server.js |
