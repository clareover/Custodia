/**
 * Custodia / Catholic Movie Guide — Magisterium AI Chat
 * Shared chat logic for standalone page + floating widget
 */

(function () {
  const DIRECT_API_URL = "https://www.magisterium.com/api/v1/chat/completions";

  function getConfig() {
    return window.MAGISTERIUM_CONFIG || null;
  }

  function getEndpoint(config) {
    if (config && config.proxyUrl) {
      return { url: config.proxyUrl, useProxy: true };
    }
    return { url: DIRECT_API_URL, useProxy: false };
  }

  function createMessageEl(role, content, citations) {
    const div = document.createElement("div");
    div.className = `msg msg-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = content;
    div.appendChild(bubble);

    if (citations && citations.length) {
      const citeWrap = document.createElement("div");
      citeWrap.className = "msg-citations";
      citeWrap.innerHTML = "<strong>Sources</strong>";
      const ul = document.createElement("ul");
      citations.forEach((c) => {
        const li = document.createElement("li");
        const title = c.document_title || "Document";
        const ref = c.document_reference ? ` (§${c.document_reference})` : "";
        const author = c.document_author ? ` — ${c.document_author}` : "";
        li.textContent = `${title}${ref}${author}`;
        ul.appendChild(li);
      });
      citeWrap.appendChild(ul);
      div.appendChild(citeWrap);
    }

    return div;
  }

  function createChatUI(container, options = {}) {
    const isWidget = options.mode === "widget";

    container.innerHTML = `
      <div class="mag-chat ${isWidget ? "mag-chat-widget" : "mag-chat-page"}" id="mag-chat-root">
        ${
          isWidget
            ? `<button class="mag-chat-toggle" id="mag-chat-toggle" aria-label="Open chat">
                <span class="mag-chat-toggle-icon">✝</span>
                <span class="mag-chat-toggle-label">Ask the Church</span>
              </button>`
            : ""
        }
        <div class="mag-chat-panel ${isWidget ? "hidden" : ""}" id="mag-chat-panel">
          <header class="mag-chat-header">
            <div class="mag-chat-header-text">
              <span class="mag-chat-title">Magisterium AI</span>
              <span class="mag-chat-subtitle">Catholic answers with sources</span>
            </div>
            ${
              isWidget
                ? `<button class="mag-chat-close" id="mag-chat-close" aria-label="Close">×</button>`
                : ""
            }
          </header>
          <div class="mag-chat-messages" id="mag-chat-messages">
            <div class="msg msg-assistant">
              <div class="msg-bubble">
                Peace be with you. Ask a question about Catholic teaching, Scripture, the saints, or how to evaluate media with the mind of the Church.
              </div>
            </div>
          </div>
          <div class="mag-chat-status" id="mag-chat-status"></div>
          <form class="mag-chat-form" id="mag-chat-form">
            <textarea
              id="mag-chat-input"
              rows="1"
              placeholder="Ask a question…"
              autocomplete="off"
            ></textarea>
            <button type="submit" class="mag-chat-send" id="mag-chat-send" aria-label="Send">
              Send
            </button>
          </form>
          <p class="mag-chat-footer">
            Powered by <a href="https://www.magisterium.com" target="_blank" rel="noopener">Magisterium AI</a>
          </p>
        </div>
      </div>
    `;

    const root = container.querySelector("#mag-chat-root");
    const panel = container.querySelector("#mag-chat-panel");
    const messagesEl = container.querySelector("#mag-chat-messages");
    const form = container.querySelector("#mag-chat-form");
    const input = container.querySelector("#mag-chat-input");
    const statusEl = container.querySelector("#mag-chat-status");
    const sendBtn = container.querySelector("#mag-chat-send");

    const history = [
      {
        role: "system",
        content:
          (getConfig() && getConfig().systemPrompt) ||
          "You are a helpful assistant grounded in Catholic teaching.",
      },
    ];

    // Widget open / close
    if (isWidget) {
      const toggle = container.querySelector("#mag-chat-toggle");
      const closeBtn = container.querySelector("#mag-chat-close");
      toggle.addEventListener("click", () => {
        panel.classList.remove("hidden");
        toggle.classList.add("hidden");
        input.focus();
      });
      closeBtn.addEventListener("click", () => {
        panel.classList.add("hidden");
        toggle.classList.remove("hidden");
      });
    }

    // Auto-resize textarea
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const config = getConfig();
      if (!config) {
        statusEl.textContent = "Config missing. Check js/config.js is loaded.";
        statusEl.className = "mag-chat-status error";
        return;
      }

      const endpoint = getEndpoint(config);
      if (!endpoint.useProxy && (!config.apiKey || config.apiKey.includes("PASTE_YOUR"))) {
        statusEl.textContent =
          "Start the proxy (node proxy/server.js) or set an API key. See README.";
        statusEl.className = "mag-chat-status error";
        return;
      }

      // User message
      history.push({ role: "user", content: text });
      messagesEl.appendChild(createMessageEl("user", text));
      input.value = "";
      input.style.height = "auto";
      messagesEl.scrollTop = messagesEl.scrollHeight;

      // Loading
      statusEl.textContent = "Thinking…";
      statusEl.className = "mag-chat-status loading";
      sendBtn.disabled = true;

      const messagesPayload = [
        { role: "system", content: history[0].content },
        ...history.slice(1),
      ];

      try {
        const headers = { "Content-Type": "application/json" };
        // Only send Authorization when calling Magisterium directly (not via proxy)
        if (!endpoint.useProxy && config.apiKey) {
          headers.Authorization = `Bearer ${config.apiKey}`;
        }

        const res = await fetch(endpoint.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: config.model || "magisterium-1",
            messages: messagesPayload,
            stream: false,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error ${res.status}: ${errText.slice(0, 300)}`);
        }

        const data = await res.json();
        const answer =
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content
            ? data.choices[0].message.content
            : "No response received.";

        const citations = data.citations || [];

        history.push({ role: "assistant", content: answer });
        messagesEl.appendChild(createMessageEl("assistant", answer, citations));
        statusEl.textContent = "";
        statusEl.className = "mag-chat-status";
      } catch (err) {
        console.error(err);
        let hint =
          "Something went wrong. See browser console for details.";
        if (String(err.message || err).includes("Failed to fetch")) {
          hint =
            "Cannot reach proxy. Is it running? In a terminal: cd magisterium-chat/proxy && node server.js";
        }
        statusEl.textContent = hint;
        statusEl.className = "mag-chat-status error";
        messagesEl.appendChild(
          createMessageEl(
            "assistant",
            "Sorry — I could not reach Magisterium AI. Please try again in a moment."
          )
        );
      } finally {
        sendBtn.disabled = false;
        messagesEl.scrollTop = messagesEl.scrollHeight;
        input.focus();
      }
    });

    // Enter to send (Shift+Enter for newline)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  // Public init
  window.MagisteriumChat = {
    /**
     * @param {string|HTMLElement} target - selector or element
     * @param {{ mode?: 'page' | 'widget' }} options
     */
    init(target, options = {}) {
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      if (!el) {
        console.error("MagisteriumChat: target not found", target);
        return;
      }
      createChatUI(el, options);
    },
  };
})();
