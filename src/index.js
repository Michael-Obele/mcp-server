"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var server = new mcp_js_1.McpServer({
    name: "mcp-server",
    version: "1.0.0",
    capabilities: { resources: {}, tools: {} },
});
var transport = new stdio_js_1.StdioServerTransport();
server.connect(transport).then(function () {
    console.log("MCP server started");
});
