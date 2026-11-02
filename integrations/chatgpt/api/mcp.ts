import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createApp } from "../app.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") { res.writeHead(405,{"allow":"POST"}).end("Method Not Allowed");return; }
  const origin=req.headers.origin;
  if (origin && !["https://chatgpt.com","https://www.chatgpt.com"].includes(origin)) {
    res.writeHead(403).end("Origin not allowed");return;
  }
  const server=createApp();
  const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
  try { await server.connect(transport); await transport.handleRequest(req,res); }
  catch (error) { console.error("MCP request failed",error);if(!res.headersSent) res.writeHead(500).end("Internal server error"); }
  finally { await transport.close();await server.close(); }
}
