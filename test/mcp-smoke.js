import assert from "node:assert/strict";
import { spawn } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const port = 8835;
const baseUrl = `http://127.0.0.1:${port}`;

const child = spawn(process.execPath, ["server/index.js"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(port), PUBLIC_BASE_URL: baseUrl, NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

async function waitForHealth() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return response.json();
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become healthy. Output:\n${output}`);
}

const client = new Client({ name: "fermah-mcp-smoke-test", version: "1.0.0" });

try {
  const health = await waitForHealth();
  assert.equal(health.ok, true);

  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  await client.connect(transport);

  const tools = await client.listTools();
  assert.equal(tools.tools.length, 6);
  assert.ok(tools.tools.some((tool) => tool.name === "search_fermah_docs"));

  const search = await client.callTool({
    name: "search_fermah_docs",
    arguments: { query: "Froben proof market", limit: 3 },
  });
  assert.match(search.content[0].text, /Froben/);

  const products = await client.callTool({ name: "list_fermah_products", arguments: {} });
  assert.match(products.content[0].text, /Fermah Kernel/);

  const resources = await client.listResources();
  assert.equal(resources.resources.length, 2);

  const prompts = await client.listPrompts();
  assert.equal(prompts.prompts.length, 1);

  console.log(`MCP smoke test passed: ${tools.tools.length} tools, ${resources.resources.length} resources, ${prompts.prompts.length} prompt`);
} finally {
  await client.close().catch(() => undefined);
  child.kill("SIGTERM");
  await new Promise((resolve) => {
    child.once("exit", resolve);
    setTimeout(resolve, 2_000).unref();
  });
}
