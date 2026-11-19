import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createApp } from "./app.js";
const PORT = Number(process.env.PORT || 3400);
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
