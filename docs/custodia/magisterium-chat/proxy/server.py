#!/usr/bin/env python3
"""
Local proxy for Magisterium AI Chat Completions API.
Keeps your API key off the frontend and avoids CORS errors.

Usage:
  export MAGISTERIUM_API_KEY="your-key-here"
  python3 server.py

Then open the chat page — it calls http://127.0.0.1:3001/chat
"""

import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = 3001
KEY = os.environ.get("MAGISTERIUM_API_KEY", "PASTE_YOUR_MAGISTERIUM_API_KEY_HERE")
MAGISTERIUM_URL = "https://www.magisterium.com/api/v1/chat/completions"


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            body = json.dumps(
                {"ok": True, "keyConfigured": "PASTE_YOUR" not in KEY}
            ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/chat":
            self.send_response(404)
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"error":"Not found. POST to /chat"}')
            return

        if not KEY or "PASTE_YOUR" in KEY:
            body = json.dumps(
                {
                    "error": "API key not set. Run: export MAGISTERIUM_API_KEY=\"your-key\" then restart."
                }
            ).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            parsed = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            self.send_response(400)
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid JSON"}')
            return

        payload = json.dumps(
            {
                "model": parsed.get("model") or "magisterium-1",
                "messages": parsed.get("messages") or [],
                "stream": False,
            }
        ).encode()

        req = urllib.request.Request(
            MAGISTERIUM_URL,
            data=payload,
            headers={
                "Authorization": f"Bearer {KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = resp.read()
                status = resp.status
        except urllib.error.HTTPError as e:
            data = e.read()
            status = e.code
        except Exception as e:
            data = json.dumps({"error": f"Proxy failed: {e}"}).encode()
            status = 502

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        print("[proxy]", args[0] if args else format)


if __name__ == "__main__":
    print()
    print("  Magisterium proxy (Python)")
    print(f"  → http://127.0.0.1:{PORT}/chat")
    print(f"  → Health: http://127.0.0.1:{PORT}/health")
    if "PASTE_YOUR" in KEY:
        print()
        print("  ⚠  No API key set.")
        print('     export MAGISTERIUM_API_KEY="your-key"')
        print("     then run this script again.")
    else:
        print("  ✓ API key loaded")
    print()
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
