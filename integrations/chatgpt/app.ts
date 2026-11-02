import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GAME_URI, gameHtml } from "./game-widget.js";
import { validateAdventureDraft } from "./adventure-schema.js";
import { toEldernightPreview } from "./eldernight-preview.js";

const PUBLIC_SITE = "https://www.eldernight.com";
const json = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] });
export function createApp() {
  const server = new McpServer({ name: "eldernight-adventures", version: "0.1.0" }, {
    instructions: "ELDERNIGHT is a fantasy adventure creator. Offer play or design. Preview draft stories before suggesting changes. Never claim a draft was saved or published; these tools do not save or publish. Use only published share tokens to read games."
  });
  server.registerResource("eldernight-game", GAME_URI, { mimeType: "text/html" }, async () => ({
    contents: [{ uri: GAME_URI, mimeType: "text/html", text: gameHtml }]
  }));
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
    inputSchema: { draft: z.unknown() },
    _meta: { "openai/outputTemplate": GAME_URI }
  }, async ({ draft }) => {
    const output=toEldernightPreview(draft);
    return { ...json(output), structuredContent: output };
  });
  server.registerTool("get_published_adventure", {
    description: "Load an ELDERNIGHT adventure from its explicitly shared public token; never loads private games.",
    inputSchema: { shareToken: z.string().regex(/^[a-f0-9]{48}$/) },
    _meta: { "openai/outputTemplate": GAME_URI }
  }, async ({ shareToken }) => {
    try {
      const response = await fetch(`${PUBLIC_SITE}/api/play/${shareToken}`, {
        headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000), redirect: "error"
      });
      if (!response.ok) return json({ ok: false, error: "Published adventure unavailable" });
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("story" in payload)) return json({ok:false,error:"Unexpected story response"});
      const output={ ok: true, ...payload };
      return { ...json(output), structuredContent: output };
    } catch {
      return json({ ok: false, error: "Could not load published adventure" });
    }
  });
  return server;
}

