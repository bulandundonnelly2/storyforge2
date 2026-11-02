import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const port = 3417;
const processServer = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
  cwd: import.meta.dirname,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore","pipe","pipe"]
});
let diagnostic = "";
processServer.stderr.on("data", chunk => diagnostic += String(chunk));
try {
  let healthy = false;
  for(let attempt = 0;attempt<35;attempt++) {
    try {
      const response=await fetch(`http://127.0.0.1:${port}/health`);
      if(response.ok) {healthy=true;break;}
    } catch {}
    await sleep(250);
  }
  assert.ok(healthy, `MCP server did not start: ${diagnostic}`);
  const transport=new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`));
  const client=new Client({name:"eldernight-smoke",version:"0.1.0"});
  try {
    await client.connect(transport);
    const {tools}=await client.listTools();
    const names=tools.map(tool=>tool.name);
    for(const required of ["get_app_options","validate_adventure_draft","preview_adventure","get_published_adventure"]) {
      assert.ok(names.includes(required),`Missing MCP tool ${required}`);
    }
    const result=await client.callTool({name:"get_app_options",arguments:{}});
    assert.ok(Array.isArray(result.content) && result.content.length>0);
    const preview=await client.callTool({name:"preview_adventure",arguments:{draft:{
      title:"Test",premise:"Test adventure",genre:"Fantasy",readingLevel:3,startSceneId:"one",
      scenes:[{id:"one",title:"Start",narration:"You stand before the gate.",ending:"victory",choices:[]}]
    }}});
    const payload = preview.content?.find(item => item.type === "text");
    assert.ok(payload && payload.type === "text", "No JSON text tool response");
    const parsed = JSON.parse(payload.text);
    assert.equal(parsed.ok, true, JSON.stringify(parsed));
    console.log("MCP handshake, tools/list and preview_adventure: PASS");
  } finally {await client.close();}
} finally {processServer.kill();}
