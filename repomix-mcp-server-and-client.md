This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where empty lines have been removed, line numbers have been added, security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Empty lines have been removed from all files
- Line numbers have been added to the beginning of each line
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
src/
  data/
    users.json
  client.ts
  server.ts
.gitignore
LICENSE
package.json
tsconfig.json
```

# Files

## File: src/data/users.json
````json
 1: [
 2:   {
 3:     "id": 1,
 4:     "name": "Alice Johnson",
 5:     "email": "alice@test.com",
 6:     "address": "123 Maple St, Springfield, IL",
 7:     "phone": "555-1234"
 8:   },
 9:   {
10:     "id": 2,
11:     "name": "Bob Smith",
12:     "email": "bob@test.com",
13:     "address": "456 Oak St, Springfield, IL",
14:     "phone": "555-5678"
15:   },
16:   {
17:     "id": 3,
18:     "name": "Charlie Brown",
19:     "email": "charlie@test.com",
20:     "address": "123 Main St, Omaha, NE",
21:     "phone": "555-8765"
22:   },
23:   {
24:     "id": 4,
25:     "name": "Kyle",
26:     "email": "test@test.com",
27:     "address": "sdfsdfsdfsdf",
28:     "phone": "34545634534"
29:   },
30:   {
31:     "id": 5,
32:     "name": "John Doe",
33:     "email": "john.doe@example.com",
34:     "address": "123 Main Street, Anytown, ST 12345",
35:     "phone": "+1-555-123-4567"
36:   },
37:   {
38:     "id": 6,
39:     "name": "Kyle",
40:     "email": "test@test.com",
41:     "address": "1234 Main st",
42:     "phone": "234345345"
43:   },
44:   {
45:     "id": 7,
46:     "name": "Jessica M. Turner",
47:     "email": "jessica.turner84@gmail.com",
48:     "address": "4821 Willowbrook Lane, Apt 3B, Columbus, OH 43220",
49:     "phone": "(614) 555-2378"
50:   },
51:   {
52:     "id": 8,
53:     "name": "Jessica Ramirez",
54:     "email": "jessica.ramirez82@gmail.com",
55:     "address": "1842 Willowbrook Lane, Austin, TX 78741",
56:     "phone": "(512) 555-3472"
57:   },
58:   {
59:     "id": 9,
60:     "name": "Kyle",
61:     "email": "test@test.com",
62:     "address": "567567",
63:     "phone": "asfasdfasdfdsa"
64:   },
65:   {
66:     "id": 10,
67:     "name": "Kyle",
68:     "email": "test@test.com",
69:     "address": "345345",
70:     "phone": "345345345"
71:   },
72:   {
73:     "id": 11,
74:     "firstName": "Eleanor",
75:     "lastName": "Vance",
76:     "email": "eleanor.vance78@example.com",
77:     "address": {
78:       "street": "481 Oak Street",
79:       "city": "Anytown",
80:       "state": "CA",
81:       "zipCode": "91234"
82:     },
83:     "phoneNumber": "555-234-5678"
84:   }
85: ]
````

## File: src/client.ts
````typescript
  1: import "dotenv/config"
  2: import { createGoogleGenerativeAI } from "@ai-sdk/google"
  3: import { confirm, input, select } from "@inquirer/prompts"
  4: import { Client } from "@modelcontextprotocol/sdk/client/index.js"
  5: import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
  6: import {
  7:   CreateMessageRequestSchema,
  8:   Prompt,
  9:   PromptMessage,
 10:   Tool,
 11: } from "@modelcontextprotocol/sdk/types.js"
 12: import { generateText, jsonSchema, ToolSet } from "ai"
 13: const mcp = new Client(
 14:   {
 15:     name: "text-client-video",
 16:     version: "1.0.0",
 17:   },
 18:   { capabilities: { sampling: {} } }
 19: )
 20: const transport = new StdioClientTransport({
 21:   command: "node",
 22:   args: ["build/server.js"],
 23:   stderr: "ignore",
 24: })
 25: const google = createGoogleGenerativeAI({
 26:   apiKey: process.env.GEMINI_API_KEY,
 27: })
 28: async function main() {
 29:   await mcp.connect(transport)
 30:   const [{ tools }, { prompts }, { resources }, { resourceTemplates }] =
 31:     await Promise.all([
 32:       mcp.listTools(),
 33:       mcp.listPrompts(),
 34:       mcp.listResources(),
 35:       mcp.listResourceTemplates(),
 36:     ])
 37:   mcp.setRequestHandler(CreateMessageRequestSchema, async request => {
 38:     const texts: string[] = []
 39:     for (const message of request.params.messages) {
 40:       const text = await handleServerMessagePrompt(message)
 41:       if (text != null) texts.push(text)
 42:     }
 43:     return {
 44:       role: "user",
 45:       model: "gemini-2.0-flash",
 46:       stopReason: "endTurn",
 47:       content: {
 48:         type: "text",
 49:         text: texts.join("\n"),
 50:       },
 51:     }
 52:   })
 53:   console.log("You are connected!")
 54:   while (true) {
 55:     const option = await select({
 56:       message: "What would you like to do",
 57:       choices: ["Query", "Tools", "Resources", "Prompts"],
 58:     })
 59:     switch (option) {
 60:       case "Tools":
 61:         const toolName = await select({
 62:           message: "Select a tool",
 63:           choices: tools.map(tool => ({
 64:             name: tool.annotations?.title || tool.name,
 65:             value: tool.name,
 66:             description: tool.description,
 67:           })),
 68:         })
 69:         const tool = tools.find(t => t.name === toolName)
 70:         if (tool == null) {
 71:           console.error("Tool not found.")
 72:         } else {
 73:           await handleTool(tool)
 74:         }
 75:         break
 76:       case "Resources":
 77:         const resourceUri = await select({
 78:           message: "Select a resource",
 79:           choices: [
 80:             ...resources.map(resource => ({
 81:               name: resource.name,
 82:               value: resource.uri,
 83:               description: resource.description,
 84:             })),
 85:             ...resourceTemplates.map(template => ({
 86:               name: template.name,
 87:               value: template.uriTemplate,
 88:               description: template.description,
 89:             })),
 90:           ],
 91:         })
 92:         const uri =
 93:           resources.find(r => r.uri === resourceUri)?.uri ??
 94:           resourceTemplates.find(r => r.uriTemplate === resourceUri)
 95:             ?.uriTemplate
 96:         if (uri == null) {
 97:           console.error("Resource not found.")
 98:         } else {
 99:           await handleResource(uri)
100:         }
101:         break
102:       case "Prompts":
103:         const promptName = await select({
104:           message: "Select a prompt",
105:           choices: prompts.map(prompt => ({
106:             name: prompt.name,
107:             value: prompt.name,
108:             description: prompt.description,
109:           })),
110:         })
111:         const prompt = prompts.find(p => p.name === promptName)
112:         if (prompt == null) {
113:           console.error("Prompt not found.")
114:         } else {
115:           await handlePrompt(prompt)
116:         }
117:         break
118:       case "Query":
119:         await handleQuery(tools)
120:     }
121:   }
122: }
123: async function handleQuery(tools: Tool[]) {
124:   const query = await input({ message: "Enter your query" })
125:   const { text, toolResults } = await generateText({
126:     model: google("gemini-2.0-flash"),
127:     prompt: query,
128:     tools: tools.reduce(
129:       (obj, tool) => ({
130:         ...obj,
131:         [tool.name]: {
132:           description: tool.description,
133:           parameters: jsonSchema(tool.inputSchema),
134:           execute: async (args: Record<string, any>) => {
135:             return await mcp.callTool({
136:               name: tool.name,
137:               arguments: args,
138:             })
139:           },
140:         },
141:       }),
142:       {} as ToolSet
143:     ),
144:   })
145:   console.log(
146:     // @ts-expect-error
147:     text || toolResults[0]?.result?.content[0]?.text || "No text generated."
148:   )
149: }
150: async function handleTool(tool: Tool) {
151:   const args: Record<string, string> = {}
152:   for (const [key, value] of Object.entries(
153:     tool.inputSchema.properties ?? {}
154:   )) {
155:     args[key] = await input({
156:       message: `Enter value for ${key} (${(value as { type: string }).type}):`,
157:     })
158:   }
159:   const res = await mcp.callTool({
160:     name: tool.name,
161:     arguments: args,
162:   })
163:   console.log((res.content as [{ text: string }])[0].text)
164: }
165: async function handleResource(uri: string) {
166:   let finalUri = uri
167:   const paramMatches = uri.match(/{([^}]+)}/g)
168:   if (paramMatches != null) {
169:     for (const paramMatch of paramMatches) {
170:       const paramName = paramMatch.replace("{", "").replace("}", "")
171:       const paramValue = await input({
172:         message: `Enter value for ${paramName}:`,
173:       })
174:       finalUri = finalUri.replace(paramMatch, paramValue)
175:     }
176:   }
177:   const res = await mcp.readResource({
178:     uri: finalUri,
179:   })
180:   console.log(
181:     JSON.stringify(JSON.parse(res.contents[0].text as string), null, 2)
182:   )
183: }
184: async function handlePrompt(prompt: Prompt) {
185:   const args: Record<string, string> = {}
186:   for (const arg of prompt.arguments ?? []) {
187:     args[arg.name] = await input({
188:       message: `Enter value for ${arg.name}:`,
189:     })
190:   }
191:   const response = await mcp.getPrompt({
192:     name: prompt.name,
193:     arguments: args,
194:   })
195:   for (const message of response.messages) {
196:     console.log(await handleServerMessagePrompt(message))
197:   }
198: }
199: async function handleServerMessagePrompt(message: PromptMessage) {
200:   if (message.content.type !== "text") return
201:   console.log(message.content.text)
202:   const run = await confirm({
203:     message: "Would you like to run the above prompt",
204:     default: true,
205:   })
206:   if (!run) return
207:   const { text } = await generateText({
208:     model: google("gemini-2.0-flash"),
209:     prompt: message.content.text,
210:   })
211:   return text
212: }
213: main()
````

## File: src/server.ts
````typescript
  1: import {
  2:   McpServer,
  3:   ResourceTemplate,
  4: } from "@modelcontextprotocol/sdk/server/mcp.js"
  5: import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
  6: import { z } from "zod"
  7: import fs from "node:fs/promises"
  8: import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js"
  9: const server = new McpServer({
 10:   name: "test-video",
 11:   version: "1.0.0",
 12:   capabilities: {
 13:     resources: {},
 14:     tools: {},
 15:     prompts: {},
 16:   },
 17: })
 18: server.resource(
 19:   "users",
 20:   "users://all",
 21:   {
 22:     description: "Get all users data from the database",
 23:     title: "Users",
 24:     mimeType: "application/json",
 25:   },
 26:   async uri => {
 27:     const users = await import("./data/users.json", {
 28:       with: { type: "json" },
 29:     }).then(m => m.default)
 30:     return {
 31:       contents: [
 32:         {
 33:           uri: uri.href,
 34:           text: JSON.stringify(users),
 35:           mimeType: "application/json",
 36:         },
 37:       ],
 38:     }
 39:   }
 40: )
 41: server.resource(
 42:   "user-details",
 43:   new ResourceTemplate("users://{userId}/profile", { list: undefined }),
 44:   {
 45:     description: "Get a user's details from teh database",
 46:     title: "User Details",
 47:     mimeType: "application/json",
 48:   },
 49:   async (uri, { userId }) => {
 50:     const users = await import("./data/users.json", {
 51:       with: { type: "json" },
 52:     }).then(m => m.default)
 53:     const user = users.find(u => u.id === parseInt(userId as string))
 54:     if (user == null) {
 55:       return {
 56:         contents: [
 57:           {
 58:             uri: uri.href,
 59:             text: JSON.stringify({ error: "User not found" }),
 60:             mimeType: "application/json",
 61:           },
 62:         ],
 63:       }
 64:     }
 65:     return {
 66:       contents: [
 67:         {
 68:           uri: uri.href,
 69:           text: JSON.stringify(user),
 70:           mimeType: "application/json",
 71:         },
 72:       ],
 73:     }
 74:   }
 75: )
 76: server.tool(
 77:   "create-user",
 78:   "Create a new user in the database",
 79:   {
 80:     name: z.string(),
 81:     email: z.string(),
 82:     address: z.string(),
 83:     phone: z.string(),
 84:   },
 85:   {
 86:     title: "Create User",
 87:     readOnlyHint: false,
 88:     destructiveHint: false,
 89:     idempotentHint: false,
 90:     openWorldHint: true,
 91:   },
 92:   async params => {
 93:     try {
 94:       const id = await createUser(params)
 95:       return {
 96:         content: [{ type: "text", text: `User ${id} created successfully` }],
 97:       }
 98:     } catch {
 99:       return {
100:         content: [{ type: "text", text: "Failed to save user" }],
101:       }
102:     }
103:   }
104: )
105: server.tool(
106:   "create-random-user",
107:   "Create a random user with fake data",
108:   {
109:     title: "Create Random User",
110:     readOnlyHint: false,
111:     destructiveHint: false,
112:     idempotentHint: false,
113:     openWorldHint: true,
114:   },
115:   async () => {
116:     const res = await server.server.request(
117:       {
118:         method: "sampling/createMessage",
119:         params: {
120:           messages: [
121:             {
122:               role: "user",
123:               content: {
124:                 type: "text",
125:                 text: "Generate fake user data. The user should have a realistic name, email, address, and phone number. Return this data as a JSON object with no other text or formatter so it can be used with JSON.parse.",
126:               },
127:             },
128:           ],
129:           maxTokens: 1024,
130:         },
131:       },
132:       CreateMessageResultSchema
133:     )
134:     if (res.content.type !== "text") {
135:       return {
136:         content: [{ type: "text", text: "Failed to generate user data" }],
137:       }
138:     }
139:     try {
140:       const fakeUser = JSON.parse(
141:         res.content.text
142:           .trim()
143:           .replace(/^```json/, "")
144:           .replace(/```$/, "")
145:           .trim()
146:       )
147:       const id = await createUser(fakeUser)
148:       return {
149:         content: [{ type: "text", text: `User ${id} created successfully` }],
150:       }
151:     } catch {
152:       return {
153:         content: [{ type: "text", text: "Failed to generate user data" }],
154:       }
155:     }
156:   }
157: )
158: server.prompt(
159:   "generate-fake-user",
160:   "Generate a fake user based on a given name",
161:   {
162:     name: z.string(),
163:   },
164:   ({ name }) => {
165:     return {
166:       messages: [
167:         {
168:           role: "user",
169:           content: {
170:             type: "text",
171:             text: `Generate a fake user with the name ${name}. The user should have a realistic email, address, and phone number.`,
172:           },
173:         },
174:       ],
175:     }
176:   }
177: )
178: async function createUser(user: {
179:   name: string
180:   email: string
181:   address: string
182:   phone: string
183: }) {
184:   const users = await import("./data/users.json", {
185:     with: { type: "json" },
186:   }).then(m => m.default)
187:   const id = users.length + 1
188:   users.push({ id, ...user })
189:   await fs.writeFile("./src/data/users.json", JSON.stringify(users, null, 2))
190:   return id
191: }
192: async function main() {
193:   const transport = new StdioServerTransport()
194:   await server.connect(transport)
195: }
196: main()
````

## File: .gitignore
````
1: .env
2: /build
3: /node_modules
````

## File: LICENSE
````
 1: MIT License
 2: 
 3: Copyright (c) 2025 WebDevSimplified
 4: 
 5: Permission is hereby granted, free of charge, to any person obtaining a copy
 6: of this software and associated documentation files (the "Software"), to deal
 7: in the Software without restriction, including without limitation the rights
 8: to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 9: copies of the Software, and to permit persons to whom the Software is
10: furnished to do so, subject to the following conditions:
11: 
12: The above copyright notice and this permission notice shall be included in all
13: copies or substantial portions of the Software.
14: 
15: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
16: IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
17: FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
18: AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
19: LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
20: OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
21: SOFTWARE.
````

## File: package.json
````json
 1: {
 2:   "name": "mcp-server-and-client",
 3:   "version": "1.0.0",
 4:   "main": "src/server.ts",
 5:   "scripts": {
 6:     "server:build": "tsc",
 7:     "server:build:watch": "tsc --watch",
 8:     "server:dev": "tsx src/server.ts",
 9:     "server:inspect": "set DANGEROUSLY_OMIT_AUTH=true && npx @modelcontextprotocol/inspector npm run server:dev",
10:     "client:dev": "tsx src/client.ts"
11:   },
12:   "keywords": [],
13:   "author": "",
14:   "license": "ISC",
15:   "description": "",
16:   "devDependencies": {
17:     "@modelcontextprotocol/inspector": "^0.14.3",
18:     "@types/node": "^24.0.3",
19:     "tsx": "^4.20.3",
20:     "typescript": "^5.8.3"
21:   },
22:   "dependencies": {
23:     "@ai-sdk/google": "^1.2.19",
24:     "@inquirer/prompts": "^7.5.3",
25:     "@modelcontextprotocol/sdk": "^1.13.0",
26:     "ai": "^4.3.16",
27:     "dotenv": "^16.5.0",
28:     "zod": "^3.25.67"
29:   }
30: }
````

## File: tsconfig.json
````json
 1: {
 2:   "compilerOptions": {
 3:     "target": "ES2022",
 4:     "module": "Node16",
 5:     "moduleResolution": "Node16",
 6:     "outDir": "./build",
 7:     "rootDir": "./src",
 8:     "strict": true,
 9:     "esModuleInterop": true,
10:     "skipLibCheck": true,
11:     "forceConsistentCasingInFileNames": true,
12:     "resolveJsonModule": true
13:   },
14:   "include": ["src/**/*"],
15:   "exclude": ["node_modules"]
16: }
````
