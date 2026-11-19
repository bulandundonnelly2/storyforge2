import type { IncomingMessage, ServerResponse } from "node:http";
export default function handler(_req: IncomingMessage,res:ServerResponse) {
  res.writeHead(200,{"content-type":"application/json"}).end(JSON.stringify({ok:true,name:"eldernight-adventures",mode:"preview"}));
}
