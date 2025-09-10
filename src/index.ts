import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
  capabilities: { resources: {}, tools: {} },
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.log("MCP server started");
});
