import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { validateAdventureDraft } from "./adventure-schema.js";
import { toEldernightPreview } from "./eldernight-preview.js";

const PORT = Number(process.env.PORT || 3400);
const PUBLIC_SITE = "https://www.eldernight.com";
const json = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] });
function createApp() {
  const server = new McpServer({ name: "eldernight-adventures", version: "0.1.0" }, {
    instructions: "ELDERNIGHT is a fantasy adventure creator. Offer play or design. Preview draft stories before suggesting changes. Never claim a draft was saved or published; these tools do not save or publish. Use only published share tokens to read games."
  });
  server.registerTool("get_app_options", {
    description: "Show the ways to play and design ELDERNIGHT adventures.",
    inputSchema: {}
  }, async () => json({
    modes: ["Design Your Own Adventure", "Play a Published Adventure"],
    design: "Create branching scenes, 1–5 star difficulty and optional six-sided dice choices.",
    publishedGames: "Supply a published share token to read a game. Private games are unavailable.",
    save: "Not enabled; never claim an adventure was saved or published."
  }));
  server.registerTool("validate_adventure_draft", {
    description: "Validate a complete draft adventure, scene links and dice rules before preview.",
    inputSchema: { draft: z.unknown() }
  }, async ({ draft }) => json(validateAdventureDraft(draft)));
  server.registerTool("preview_adventure", {
    description: "Convert a complete adventure draft to ELDERNIGHT's game format without storing or publishing it.",
    inputSchema: { draft: z.unknown() }
  }, async ({ draft }) => json(toEldernightPreview(draft)));
  server.registerTool("get_published_adventure", {
    description: "Load an ELDERNIGHT adventure from its explicitly shared public token; never loads private games.",
    inputSchema: { shareToken: z.string().regex(/^[a-f0-9]{48}$/) }
  }, async ({ shareToken }) => {
    try {
      const response = await fetch(`${PUBLIC_SITE}/api/play/${shareToken}`, {
        headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000), redirect: "error"
      });
      if (!response.ok) return json({ ok: false, error: "Published adventure unavailable" });
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("story" in payload)) return json({ok:false,error:"Unexpected story response"});
      return json({ ok: true, ...payload });
    } catch {
      return json({ ok: false, error: "Could not load published adventure" });
    }
  });
  return server;
}

const http = createServer(async (req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, name: "eldernight-adventures", mode: "read-only-and-preview" }));
    return;
  }
  if (req.url !== "/mcp" || !["POST", "GET", "DELETE"].includes(req.method || "")) {
    res.writeHead(404).end("Not Found");
    return;
  }
  // Block suspicious cross-site browser requests. ChatGPT's server-side
  // connector normally sends no browser Origin header.
  const origin = req.headers.origin;
  if (origin && origin !== "https://chatgpt.com" && origin !== "https://www.chatgpt.com") {
    res.writeHead(403).end("Origin not allowed");
    return;
  }
  const server = createApp();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, enableJsonResponse: true
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (e) {
    console.error("MCP error", e);
    if (!res.headersSent) res.writeHead(500).end("Internal server error");
  } finally {
    await transport.close();
    await server.close();
  }
});
http.listen(PORT, () => console.log(`ELDERNIGHT MCP preview listening on port ${PORT}`));
